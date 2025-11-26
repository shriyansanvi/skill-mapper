from django.contrib import admin
from .models import (
    Skill, 
    Resume, 
    BusinessProfile, 
    GovtProfile, 
    JobPosting, 
    SelfHelpGroup,
    PortfolioImage
)

# --- 1. Define your Admin classes first ---

class ResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'is_verified')
    list_editable = ('is_verified',)
    list_filter = ('is_verified', 'location')
    search_fields = ('user__username', 'bio', 'location')

class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company_name', 'location', 'job_type', 'posted_by')
    list_filter = ('job_type', 'location')
    search_fields = ('title', 'company_name', 'description')

class SelfHelpGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'topic', 'member_count', 'location')
    search_fields = ('name', 'topic', 'location')

# --- 2. Register your models at the end ---

admin.site.register(Skill)
admin.site.register(Resume, ResumeAdmin)
admin.site.register(BusinessProfile)
admin.site.register(GovtProfile)
admin.site.register(JobPosting, JobPostingAdmin)
admin.site.register(SelfHelpGroup, SelfHelpGroupAdmin) 
admin.site.register(PortfolioImage)