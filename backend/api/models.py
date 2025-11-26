from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# A separate model for skills to allow for easy searching and filtering.
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# This is your "Resume Model" for the skilled woman.
class Resume(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='resume')
    
    # --- Personal Info ---
    full_name = models.CharField(max_length=200, blank=True) # New
    contact_email = models.EmailField(blank=True) # New
    contact_phone = models.CharField(max_length=20, blank=True) # New
    location = models.CharField(max_length=200)
    
    # --- Professional Details ---
    bio = models.TextField(help_text="Professional Summary")
    experience = models.TextField(blank=True, help_text="Work history") # New
    education = models.TextField(blank=True, help_text="Education details") # New
    
    availability = models.CharField(max_length=50, default='Full-time')
    is_verified = models.BooleanField(default=False)
    skills = models.ManyToManyField(Skill, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Resume"

# This is your "Business Profile Model".
class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.company_name

# This is your "Govt Profile Model".
class GovtProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department_name = models.CharField(max_length=200)
    jurisdiction = models.CharField(max_length=100) # e.g., 'District Level', 'State Level'
    contact_person = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.department_name

class JobPosting(models.Model):
    AVAILABILITY_CHOICES = [
        ('Part-time', 'Part-Time'),
        ('Full-time', 'Full-Time'),
        ('Contract', 'Contract'),
    ]

    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES)
    description = models.TextField(blank=True)
    required_skills = models.ManyToManyField(Skill, blank=True)

    # We can link this to the employer who posted it
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_postings')

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