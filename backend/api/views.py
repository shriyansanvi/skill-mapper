import os
import json
import re
from decouple import config
import google.generativeai as genai
from django.contrib.auth.models import User

from rest_framework import viewsets, status, generics, views, serializers
from rest_framework.views import APIView
from rest_framework.decorators import action
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
from .permissions import IsOwnerOrReadOnly, IsEmployer, IsWorker

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
            f'Rewrite the following into a professional resume bio for a rural artisan: '
            f'"{user_input}"\n\n'
            f'Rules — follow exactly:\n'
            f'- Output ONLY the final bio text, nothing else.\n'
            f'- Do NOT provide multiple options, choices, or alternatives.\n'
            f'- Do NOT use markdown, headers, bold text, or bullet points.\n'
            f'- Do NOT add any preamble like "Here is a bio" or "Option 1".\n'
            f'- Write exactly 2-3 plain sentences in first person.\n'
            f'- Use simple, clear language suitable for a job profile.'
        )

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            bio_text = response.text.strip()

            # Safety net: if the model still returns multiple options
            # despite instructions, keep only the first paragraph.
            if '\n\n' in bio_text:
                bio_text = bio_text.split('\n\n')[0].strip()
            # Strip any leftover markdown bold markers or option labels
            bio_text = bio_text.replace('**', '').replace('*', '')
            for marker in ['Option 1:', 'Option 2:', 'Option 1', 'Option 2']:
                bio_text = bio_text.replace(marker, '')
            bio_text = bio_text.strip()

            return Response({'bio': bio_text})
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
    """
    Read-only for everyone (workers AND employers can browse groups).
    The custom 'join'/'leave' actions are the only way to modify membership,
    and they're separately gated to workers only via IsWorker.
    """
    queryset = SelfHelpGroup.objects.all()
    serializer_class = SelfHelpGroupSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        # Needed so the serializer's is_member field can check request.user
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsWorker])
    def join(self, request, pk=None):
        """
        POST /api/groups/<id>/join/
        Only workers (non-employer accounts) can join a group.
        """
        try:
            group = SelfHelpGroup.objects.get(pk=pk)
        except SelfHelpGroup.DoesNotExist:
            return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

        if group.members.filter(id=request.user.id).exists():
            return Response({'message': 'You are already a member of this group.', 'is_member': True})

        group.members.add(request.user)
        group.member_count = group.members.count()
        group.save(update_fields=['member_count'])

        return Response({
            'message': f'You have joined {group.name}!',
            'is_member': True,
            'member_count': group.member_count,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsWorker])
    def leave(self, request, pk=None):
        """
        POST /api/groups/<id>/leave/
        Lets a worker leave a group they previously joined.
        """
        try:
            group = SelfHelpGroup.objects.get(pk=pk)
        except SelfHelpGroup.DoesNotExist:
            return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)

        group.members.remove(request.user)
        group.member_count = group.members.count()
        group.save(update_fields=['member_count'])

        return Response({
            'message': f'You have left {group.name}.',
            'is_member': False,
            'member_count': group.member_count,
        })


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

    def get_permissions(self):
        # Anyone authenticated can VIEW quizzes (list/retrieve) —
        # workers need this to see questions before taking them.
        # Only employers can CREATE/UPDATE/DELETE quizzes.
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsEmployer]
        return [permission() for permission in permission_classes]

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


class GenerateQuizView(APIView):
    """
    POST /api/jobs/<job_id>/generate-quiz/
    Body: { "topic": "embroidery techniques", "num_questions": 5 }

    Uses Gemini to generate a multiple-choice quiz on the given topic,
    then creates Quiz + Question + Choice rows linked to the job.
    Only the employer who posted the job can do this.
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def post(self, request, job_id):
        topic = request.data.get('topic', '').strip()
        num_questions = request.data.get('num_questions', 5)

        if not topic:
            return Response({'error': 'Please provide a topic for the quiz.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = JobPosting.objects.get(pk=job_id)
        except JobPosting.DoesNotExist:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if job.posted_by_id != request.user.id:
            return Response({'error': 'You can only create quizzes for your own job postings.'}, status=status.HTTP_403_FORBIDDEN)

        if Quiz.objects.filter(job=job).exists():
            return Response({'error': 'A quiz already exists for this job.'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f'Create a {num_questions}-question multiple choice skill assessment quiz '
            f'on the topic: "{topic}", relevant to a job titled "{job.title}".\n\n'
            f'Return ONLY valid JSON, no markdown, no explanation, in EXACTLY this format:\n'
            f'{{\n'
            f'  "questions": [\n'
            f'    {{\n'
            f'      "text": "question text here",\n'
            f'      "choices": [\n'
            f'        {{"text": "choice 1", "is_correct": false}},\n'
            f'        {{"text": "choice 2", "is_correct": true}},\n'
            f'        {{"text": "choice 3", "is_correct": false}},\n'
            f'        {{"text": "choice 4", "is_correct": false}}\n'
            f'      ]\n'
            f'    }}\n'
            f'  ]\n'
            f'}}\n\n'
            f'Rules:\n'
            f'- Exactly {num_questions} questions.\n'
            f'- Exactly 4 choices per question.\n'
            f'- Exactly ONE choice per question must have "is_correct": true.\n'
            f'- Questions should be practical and relevant to real-world skill assessment.\n'
            f'- Output raw JSON only — no ```json fences, no extra text before or after.'
        )

        raw_text = ''
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()

            # Safety net: strip markdown code fences if Gemini adds them anyway
            raw_text = re.sub(r'^```json\s*', '', raw_text)
            raw_text = re.sub(r'^```\s*', '', raw_text)
            raw_text = re.sub(r'```\s*$', '', raw_text)
            raw_text = raw_text.strip()

            quiz_data = json.loads(raw_text)
            questions_data = quiz_data.get('questions', [])

            if not questions_data:
                return Response({'error': 'AI did not return any questions. Try a different topic.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except json.JSONDecodeError as e:
            print(f"Quiz JSON parse error: {e} | Raw response: {raw_text[:300]}")
            return Response({'error': 'AI returned an unexpected format. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Gemini API Error (quiz generation): {e}")
            return Response({'error': 'Failed to generate quiz.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # --- Create Quiz + Questions + Choices in the database ---
        quiz = Quiz.objects.create(
            title=f"{topic.title()} Assessment",
            description=f"AI-generated skill assessment on {topic} for the {job.title} position.",
            created_by=request.user,
            job=job,
        )

        for q_data in questions_data:
            question_text = q_data.get('text', '').strip()
            choices_data = q_data.get('choices', [])

            if not question_text or len(choices_data) < 2:
                continue

            question = Question.objects.create(quiz=quiz, text=question_text)
            for c_data in choices_data:
                Choice.objects.create(
                    question=question,
                    text=c_data.get('text', '').strip(),
                    is_correct=bool(c_data.get('is_correct', False)),
                )

        return Response(QuizSerializer(quiz).data, status=status.HTTP_201_CREATED)


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