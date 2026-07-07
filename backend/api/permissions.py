from rest_framework import permissions
from .models import BusinessProfile, GovtProfile


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsEmployer(permissions.BasePermission):
    """
    Custom permission to only allow users with a business or govt profile.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            BusinessProfile.objects.filter(user=request.user).exists() or
            GovtProfile.objects.filter(user=request.user).exists()
        )


class IsWorker(permissions.BasePermission):
    """
    The inverse of IsEmployer — allows only users who do NOT have a
    BusinessProfile or GovtProfile. Used to gate worker-only actions
    like joining a Self-Help Group, so employer accounts can browse
    groups but can't join them.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        is_employer = (
            BusinessProfile.objects.filter(user=request.user).exists() or
            GovtProfile.objects.filter(user=request.user).exists()
        )
        return not is_employer