import os
from decouple import config
import google.generativeai as genai
from django.contrib.auth.models import User
from django.conf import settings

from rest_framework import viewsets, status, generics, views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import PortfolioImage
from .serializers import PortfolioImageSerializer

from .models import (
    Skill, 
    Resume, 
    BusinessProfile, 
    GovtProfile, 
    JobPosting, 
    SelfHelpGroup
)
from .serializers import (
    UserSerializer,
    SkillSerializer, 
    ResumeSerializer, 
    BusinessProfileSerializer, 
    GovtProfileSerializer,
    JobPostingSerializer,
    SelfHelpGroupSerializer,
    MyTokenObtainPairSerializer
)
from .permissions import IsOwnerOrReadOnly, IsEmployer

# Configure the Gemini client
genai.configure(api_key=config("GOOGLE_API_KEY"))


# --- Authentication & Registration Views ---

class CreateUserView(views.APIView):
    """
    A public view for creating a new user.
    """
    permission_classes = [AllowAny] # Allow anyone to access this view

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    """
    Custom view for the login token to add user type.
    """
    serializer_class = MyTokenObtainPairSerializer

# --- AI Bio Generation View ---

class GenerateBioView(views.APIView):
    """
    An API view that uses the Gemini API to generate a professional bio.
    """
    permission_classes = [IsAuthenticated] # Only logged-in users can use this

    def post(self, request, *args, **kwargs):
        # 1. Get the user's simple text
        user_input = request.data.get('text', '')
        if not user_input:
            return Response(
                {'error': 'No text provided.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Create the prompt for the AI
        prompt = f"""
        You are an expert resume writer. A rural artisan provided the 
        following description of their skills. Rewrite it into a 
        professional, one-sentence bio for their profile.
        
        User's words: "{user_input}"
        
        Professional Bio:
        """

        try:
            # 3. Call the Gemini API
            model = genai.GenerativeModel('models/gemini-pro-latest')
            response = model.generate_content(prompt)
            
            # 4. Send the AI's response back to the frontend
            return Response({'bio': response.text})

        except Exception as e:
            print(f"Gemini API Error: {e}")
            return Response(
                {'error': 'Failed to generate bio.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# --- Model ViewSets ---

class ResumeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for a user's own resume.
    Filters to only show the resume belonging to the logged-in user.
    """
    serializer_class = ResumeSerializer
    
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        This view returns a list of resumes for the
        currently authenticated user.
        """
        user = self.request.user
        return Resume.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResumeSearchView(generics.ListAPIView):
    """
    A read-only view for employers to search all resumes.
    It filters by skill name using partial matching (icontains).
    """
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        queryset = Resume.objects.all()
        
        # Get the 'skill' parameter from the URL
        skill_name = self.request.query_params.get('skill', None)
        
        if skill_name is not None and skill_name != "":
            # CHANGE: Use 'icontains' for partial matching instead of 'iexact'
            queryset = queryset.filter(skills__name__icontains=skill_name).distinct()
            
        return queryset


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A simple read-only viewset for listing all available skills.
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated] # Only logged-in users can see skills


class JobPostingViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and posting jobs.
    - Public: List and Retrieve
    - Employers: Create, Update, Delete
    """
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny] # Anyone can see jobs
        else:
            permission_classes = [IsAuthenticated, IsEmployer] # Only employers can post
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Automatically link the job to the logged-in employer
        serializer.save(posted_by=self.request.user)

class SelfHelpGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A public, read-only viewset for listing Self Help Groups.
    """
    queryset = SelfHelpGroup.objects.all()
    serializer_class = SelfHelpGroupSerializer
    permission_classes = [AllowAny] # Make it public for the homepage


class BusinessProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for business profiles.
    """
    queryset = BusinessProfile.objects.all()
    serializer_class = BusinessProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]


class GovtProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for government profiles.
    """
    queryset = GovtProfile.objects.all()
    serializer_class = GovtProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

class PortfolioImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for uploading and managing portfolio images.
    """
    serializer_class = PortfolioImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
    This view should return a list of all images
    for the currently authenticated user's resume.
    """
        # Find the resume of the logged-in user
        try:
            user_resume = Resume.objects.get(user=self.request.user)
            return PortfolioImage.objects.filter(resume=user_resume)
        except Resume.DoesNotExist:
            return PortfolioImage.objects.none() # Return no images if no resume

    def perform_create(self, serializer):
        """
        Link the uploaded image to the user's resume.
        """
        try:
            user_resume = Resume.objects.get(user=self.request.user)
            serializer.save(resume=user_resume)
        except Resume.DoesNotExist:
            raise serializers.ValidationError("User has no resume to add images to.")