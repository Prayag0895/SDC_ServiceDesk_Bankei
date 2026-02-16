from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Delete hardcoded admin user (username: admin) if it exists"

    def handle(self, *args, **options):
        admin_username = "admin"

        try:
            admin = User.objects.get(username=admin_username)
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING(
                f"Admin user '{admin_username}' does not exist"
            ))
            return

        if admin.is_superuser and User.objects.filter(is_superuser=True).count() <= 1:
            self.stdout.write(self.style.ERROR(
                "Refusing to delete the last remaining superuser"
            ))
            return

        admin.delete()
        self.stdout.write(self.style.SUCCESS(
            f"Admin user '{admin_username}' deleted"
        ))
