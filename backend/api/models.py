from django.db import models
from django.contrib.auth.models import User


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Resume(models.Model):
    AVAILABILITY_CHOICES = [
        ('Full-time', 'Full-Time'),
        ('Part-time', 'Part-Time'),
        ('Contract', 'Contract'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resume')

    # Personal Info
    full_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200)

    # Professional Details
    bio = models.TextField(help_text="Professional Summary")
    experience = models.TextField(blank=True, help_text="Work history")
    education = models.TextField(blank=True, help_text="Education details")

    availability = models.CharField(max_length=50, choices=AVAILABILITY_CHOICES, default='Full-time')
    is_verified = models.BooleanField(default=False)
    skills = models.ManyToManyField(Skill, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Resume"


class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.company_name


class GovtProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department_name = models.CharField(max_length=200)
    jurisdiction = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.department_name


class JobPosting(models.Model):
    JOB_TYPE_CHOICES = [
        ('Part-time', 'Part-Time'),
        ('Full-time', 'Full-Time'),
        ('Contract', 'Contract'),
    ]

    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    description = models.TextField(blank=True)
    required_skills = models.ManyToManyField(Skill, blank=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_postings')
    created_at = models.DateTimeField(auto_now_add=True)  # Added for sorting

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class SelfHelpGroup(models.Model):
    name = models.CharField(max_length=200)
    topic = models.CharField(max_length=200)
    member_count = models.IntegerField(default=0)
    location = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.name


class PortfolioImage(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='portfolio_images/')
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.resume.user.username} - {self.caption}"


class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes')
    job = models.ForeignKey(
        JobPosting, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='quizzes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=500)

    def __str__(self):
        return self.text


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.IntegerField()  # Score out of 100
    passed = models.BooleanField(default=False)
    date_taken = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent duplicate attempts — one attempt per user per quiz
        unique_together = ('user', 'quiz')

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {self.score}%"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    quiz_score = models.IntegerField(default=0, null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    class Meta:
        # Prevent duplicate applications to the same job
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.applicant.username} applied for {self.job.title}"