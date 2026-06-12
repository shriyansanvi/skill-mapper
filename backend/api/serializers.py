from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Skill, Resume, BusinessProfile, GovtProfile, JobPosting, 
    SelfHelpGroup, PortfolioImage, Quiz, Question, Choice, 
    QuizAttempt, JobApplication
)

# --- Authentication Serializers ---

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        is_employer = (
            BusinessProfile.objects.filter(user=user).exists() or
            GovtProfile.objects.filter(user=user).exists()
        )
        token['is_employer'] = is_employer
        return token

# --- Core Model Serializers ---

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class ResumeSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    class Meta:
        model = Resume
        fields = '__all__'

class BusinessProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessProfile
        fields = '__all__'

class GovtProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovtProfile
        fields = '__all__'

class JobPostingSerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    class Meta:
        model = JobPosting
        fields = '__all__'

class SelfHelpGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelfHelpGroup
        fields = '__all__'

class PortfolioImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    class Meta:
        model = PortfolioImage
        fields = ['id', 'resume', 'image', 'caption', 'uploaded_at']
        read_only_fields = ['resume']

# --- QUIZ SERIALIZERS (Read - For taking the quiz) ---

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text'] # Hides 'is_correct'

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'text', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'job', 'questions', 'created_at']

# --- QUIZ CREATION SERIALIZERS (Write - For Employers) ---
# This is the part you were missing!

class ChoiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['text', 'is_correct']

class QuestionCreateSerializer(serializers.ModelSerializer):
    choices = ChoiceCreateSerializer(many=True)
    class Meta:
        model = Question
        fields = ['text', 'choices']

class QuizCreateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ['title', 'description', 'job', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
        for q_data in questions_data:
            choices_data = q_data.pop('choices')
            question = Question.objects.create(quiz=quiz, **q_data)
            for c_data in choices_data:
                Choice.objects.create(question=question, **c_data)
        return quiz

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'score', 'passed', 'date_taken']
        read_only_fields = ['user', 'date_taken']

# --- Application Serializer ---

class JobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_bio = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    applicant_phone = serializers.SerializerMethodField() # Ensure this exists
    
    # --- NEW FIELDS ---
    applicant_location = serializers.SerializerMethodField()
    applicant_experience = serializers.SerializerMethodField()
    applicant_education = serializers.SerializerMethodField()
    applicant_skills = serializers.SerializerMethodField()
    
    job_title = serializers.ReadOnlyField(source='job.title')

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'applicant', 
            'applicant_name', 'applicant_bio', 'applicant_email', 'applicant_phone',
            'applicant_location', 'applicant_experience', 'applicant_education', 'applicant_skills',
            'quiz_score', 'applied_at', 'status'
        ]
        read_only_fields = ['applicant', 'applied_at']

    def get_applicant_name(self, obj):
        return obj.applicant.resume.full_name if hasattr(obj.applicant, 'resume') else obj.applicant.username

    def get_applicant_bio(self, obj):
        return obj.applicant.resume.bio if hasattr(obj.applicant, 'resume') else ""

    def get_applicant_email(self, obj):
        return obj.applicant.resume.contact_email if hasattr(obj.applicant, 'resume') else "N/A"
    
    def get_applicant_phone(self, obj):
        return obj.applicant.resume.contact_phone if hasattr(obj.applicant, 'resume') else "N/A"

    # --- NEW METHODS ---
    def get_applicant_location(self, obj):
        return obj.applicant.resume.location if hasattr(obj.applicant, 'resume') else ""

    def get_applicant_experience(self, obj):
        return obj.applicant.resume.experience if hasattr(obj.applicant, 'resume') else ""

    def get_applicant_education(self, obj):
        return obj.applicant.resume.education if hasattr(obj.applicant, 'resume') else ""

    def get_applicant_skills(self, obj):
        if hasattr(obj.applicant, 'resume'):
            return SkillSerializer(obj.applicant.resume.skills.all(), many=True).data
        return []
    
class JobPostingSerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobPosting
        fields = '__all__'
        # This tells Django: "Don't require 'posted_by' from the frontend. I will handle it."
        read_only_fields = ['posted_by']