import os
from decouple import config
import google.generativeai as genai
from django.contrib.auth.models import User

from rest_framework import viewsets, status, generics, views, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Skill, Resume, BusinessProfile, GovtProfile, JobPosting,
    SelfHelpGroup, PortfolioImage, Quiz, Question, Choice,
    QuizAttempt, JobApplication
)
from .serializers import (
    UserSerializer, SkillSerializer, ResumeSerializer,
    BusinessProfileSerializer, GovtProfileSerializer,
    JobPostingSerializer, SelfHelpGroupSerializer,
    MyTokenObtainPairSerializer, PortfolioImageSerializer,
    QuizSerializer, QuizCreateSerializer, JobApplicationSerializer
)
from .permissions import IsOwnerOrReadOnly, IsEmployer

# Configure Gemini
genai.configure(api_key=config("GOOGLE_API_KEY"))


# --- Authentication ---

class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# --- AI Feature ---

class GenerateBioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_input = request.data.get('text', '').strip()
        if not user_input:
            return Response({'error': 'No text provided.'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f'You are an expert resume writer for rural artisans. '
            f'A worker provided this description: "{user_input}". '
            f'Rewrite it into a professional, concise one-paragraph bio (2-3 sentences) '
            f'suitable for a job profile. Use simple, clear language.'
        )

        try:
            # FIX: was assigning to 'mmodel' but using 'model'
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)
            return Response({'bio': response.text})
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return Response({'error': 'Failed to generate bio.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- Core Features ---

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResumeSearchView(generics.ListAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        queryset = Resume.objects.select_related('user').prefetch_related('skills').all()
        skill_name = self.request.query_params.get('skill', None)
        if skill_name:
            queryset = queryset.filter(skills__name__icontains=skill_name).distinct()
        return queryset


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


class SelfHelpGroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SelfHelpGroup.objects.all()
    serializer_class = SelfHelpGroupSerializer
    permission_classes = [AllowAny]


class BusinessProfileViewSet(viewsets.ModelViewSet):
    queryset = BusinessProfile.objects.all()
    serializer_class = BusinessProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]


class GovtProfileViewSet(viewsets.ModelViewSet):
    queryset = GovtProfile.objects.all()
    serializer_class = GovtProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]


class PortfolioImageViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user_resume = Resume.objects.get(user=self.request.user)
            return PortfolioImage.objects.filter(resume=user_resume)
        except Resume.DoesNotExist:
            return PortfolioImage.objects.none()

    def perform_create(self, serializer):
        try:
            user_resume = Resume.objects.get(user=self.request.user)
            serializer.save(resume=user_resume)
        except Resume.DoesNotExist:
            raise serializers.ValidationError("Create a resume before uploading images.")


# --- Jobs & Applications ---

class JobPostingViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsEmployer()]

    def get_queryset(self):
        queryset = JobPosting.objects.prefetch_related('required_skills').all()
        if self.request.query_params.get('mine') == 'true' and self.request.user.is_authenticated:
            return queryset.filter(posted_by=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    def get_queryset(self):
        user = self.request.user
        is_employer = (
            BusinessProfile.objects.filter(user=user).exists() or
            GovtProfile.objects.filter(user=user).exists()
        )
        if is_employer:
            return JobApplication.objects.select_related('job', 'applicant__resume').filter(job__posted_by=user)
        return JobApplication.objects.select_related('job').filter(applicant=user)


# --- Quizzes ---

class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Quiz.objects.prefetch_related('questions__choices').all()
        # Allow filtering quizzes by job ID (used on JobDetailPage)
        job_id = self.request.query_params.get('job')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return QuizCreateSerializer
        return QuizSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.prefetch_related('questions__choices').get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

        # Prevent re-attempts
        if QuizAttempt.objects.filter(user=request.user, quiz=quiz).exists():
            existing = QuizAttempt.objects.get(user=request.user, quiz=quiz)
            return Response({
                "score": existing.score,
                "passed": existing.passed,
                "message": "You have already taken this quiz.",
                "already_attempted": True,
            })

        user_answers = request.data
        total_questions = quiz.questions.count()
        correct_answers = 0

        for question in quiz.questions.all():
            selected_choice_id = user_answers.get(str(question.id))
            if selected_choice_id:
                try:
                    choice = Choice.objects.get(pk=selected_choice_id, question=question)
                    if choice.is_correct:
                        correct_answers += 1
                except Choice.DoesNotExist:
                    pass

        score_percentage = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        passed = score_percentage >= 70

        QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score_percentage,
            passed=passed
        )

        return Response({
            "score": score_percentage,
            "passed": passed,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
        })