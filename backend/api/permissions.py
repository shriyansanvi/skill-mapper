from rest_framework import permissions
from .models import BusinessProfile, GovtProfile

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (GET, HEAD, OPTIONS).
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the resume.
        return obj.user == request.user

class IsEmployer(permissions.BasePermission):
    """
    Custom permission to only allow users with a business or govt profile.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and has a related profile
        return request.user.is_authenticated and (
            BusinessProfile.objects.filter(user=request.user).exists() or
            GovtProfile.objects.filter(user=request.user).exists()
        )