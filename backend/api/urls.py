from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    JobApplicationViewSet, ResumeViewSet, SkillViewSet,
    BusinessProfileViewSet, GovtProfileViewSet, CreateUserView,
    ResumeSearchView, MyTokenObtainPairView, JobPostingViewSet,
    SelfHelpGroupViewSet, GenerateBioView, PortfolioImageViewSet,
    QuizViewSet, SubmitQuizView,
    GenerateQuizView,  # NEW
)

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'businesses', BusinessProfileViewSet, basename='businessprofile')
router.register(r'govt', GovtProfileViewSet, basename='govtprofile')
router.register(r'jobs', JobPostingViewSet, basename='job')
router.register(r'groups', SelfHelpGroupViewSet, basename='group')
router.register(r'portfolio', PortfolioImageViewSet, basename='portfolio')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'applications', JobApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),

    path('register/', CreateUserView.as_view(), name='register'),
    path('search/', ResumeSearchView.as_view(), name='resume-search'),

    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('generate-bio/', GenerateBioView.as_view(), name='generate-bio'),
    path('quizzes/<int:pk>/submit/', SubmitQuizView.as_view(), name='submit-quiz'),

    # NEW — generate a quiz for a specific job using AI
    path('jobs/<int:job_id>/generate-quiz/', GenerateQuizView.as_view(), name='generate-quiz'),
]