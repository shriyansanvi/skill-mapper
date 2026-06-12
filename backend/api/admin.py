from django.contrib import admin
from .models import (
    Skill, Resume, BusinessProfile, GovtProfile, JobPosting, 
    SelfHelpGroup, PortfolioImage, Quiz, Question, Choice, QuizAttempt,
    JobApplication
)

# --- 1. Inline Classes (For Nested Forms) ---

class ChoiceInline(admin.TabularInline):
    """Allows adding choices directly inside a Question page"""
    model = Choice
    extra = 4 # Show 4 answer slots by default

class QuestionInline(admin.TabularInline):
    """Allows adding questions directly inside a Quiz page"""
    model = Question
    extra = 1 # Show 1 question slot by default

# --- 2. Custom Admin Views ---

class QuestionAdmin(admin.ModelAdmin):
    inlines = [ChoiceInline]
    list_display = ('text', 'quiz')

class QuizAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]
    list_display = ('title', 'job', 'created_by', 'created_at')

class ResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'is_verified')
    list_editable = ('is_verified',) # Allows toggling verification from the list
    list_filter = ('is_verified', 'location')
    search_fields = ('user__username', 'bio', 'location')

class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'job_type', 'posted_by')
    list_filter = ('job_type', 'location')
    search_fields = ('title', 'company_name', 'description')

class SelfHelpGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'topic', 'member_count', 'location')
    search_fields = ('name', 'topic', 'location')

# --- 3. Register Everything ---

admin.site.register(Skill)
admin.site.register(Resume, ResumeAdmin)
admin.site.register(BusinessProfile)
admin.site.register(GovtProfile)
admin.site.register(JobPosting, JobPostingAdmin)
admin.site.register(SelfHelpGroup, SelfHelpGroupAdmin)
admin.site.register(PortfolioImage)

# Quiz & Assessment Models
admin.site.register(Quiz, QuizAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Choice)
admin.site.register(QuizAttempt)

# Application Model
admin.site.register(JobApplication)