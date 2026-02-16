from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from login.models import Department, Domain


class Command(BaseCommand):
    help = "Create seed users for each role (department, dit, sdc, officer)."

    def handle(self, *args, **options):
        User = get_user_model()

        department, _ = Department.objects.get_or_create(name="Department of Admin")
        domain, _ = Domain.objects.get_or_create(value="NETWORK", display="Network")

        seed_password = "123"

        seeds = [
            {
                "username": "dept_demo",
                "email": "dept_demo@example.com",
                "role": "DEPARTMENT",
                "phone_number": "0800000001",
                "department_name": department,
                "domain": None,
            },
            {
                "username": "dit_demo",
                "email": "dit_demo@example.com",
                "role": "DIT",
                "phone_number": "0800000002",
                "department_name": None,
                "domain": None,
            },
            {
                "username": "sdc_demo",
                "email": "sdc_demo@example.com",
                "role": "SDC",
                "phone_number": "0800000003",
                "department_name": None,
                "domain": domain,
            },
            {
                "username": "officer_demo",
                "email": "officer_demo@example.com",
                "role": "OFFICER",
                "phone_number": "0800000004",
                "department_name": None,
                "domain": None,
            },
        ]

        created = 0
        updated = 0
        for seed in seeds:
            user, was_created = User.objects.get_or_create(
                username=seed["username"],
                defaults={
                    "email": seed["email"],
                    "role": seed["role"],
                    "phone_number": seed["phone_number"],
                    "department_name": seed["department_name"],
                    "domain": seed["domain"],
                },
            )

            if was_created:
                user.set_password(seed_password)
                user.is_approved = True  # Seed users are pre-approved
                user.save()
                created += 1
            else:
                changed = False
                for field in ["email", "role", "phone_number", "department_name", "domain"]:
                    if getattr(user, field) != seed[field]:
                        setattr(user, field, seed[field])
                        changed = True
                
                # Always update password and approval status for existing users
                user.set_password(seed_password)
                user.is_approved = True
                changed = True

                if changed:
                    user.save()
                    updated += 1

        self.stdout.write(self.style.SUCCESS("Seed users created: {}".format(created)))
        self.stdout.write(self.style.SUCCESS("Seed users updated: {}".format(updated)))
        self.stdout.write(self.style.SUCCESS("Seed user password: {}".format(seed_password)))
