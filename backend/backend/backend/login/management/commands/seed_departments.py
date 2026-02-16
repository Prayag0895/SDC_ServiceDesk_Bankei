from django.core.management.base import BaseCommand
from login.models import Department, Domain


class Command(BaseCommand):
    help = "Seed departments and domains for the system"

    def handle(self, *args, **options):
        # Comprehensive list of Sikkim Government Departments
        departments = [
            "Agriculture Department",
            "Animal Husbandry Department",
            "Building & Housing Department",
            "Cooperation Department",
            "Commerce & Industries Department",
            "Culture Department",
            "Education Department",
            "Ecclesiastical Department",
            "Energy & Power Department",
            "Finance Department",
            "Food Security & Agriculture Development Department",
            "Forest Department",
            "Health & Family Welfare Department",
            "Home Department",
            "Horticulture Department",
            "Information & Public Relations Department",
            "Information Technology Department",
            "Irrigation & Flood Control Department",
            "Labour Department",
            "Land Revenue & Disaster Management Department",
            "Law Department",
            "Mines, Minerals & Geology Department",
            "Personnel Department",
            "Planning & Development Department",
            "Public Health Engineering Department",
            "Roads & Bridges Department",
            "Rural Development Department",
            "Science & Technology Department",
            "Social Justice & Welfare Department",
            "Sports & Youth Affairs Department",
            "Tourism Department",
            "Transport Department",
            "Urban Development Department",
            "Water Security Department",
            "Women & Child Development Department"
        ]

        # Domains for SDC Staff
        domains = [
            {"value": "INFRASTRUCTURE", "display": "Infrastructure & Networking"},
            {"value": "SECURITY", "display": "Security & Compliance"},
            {"value": "APPLICATIONS", "display": "Application Development"},
            {"value": "DATABASE", "display": "Database Administration"},
            {"value": "SUPPORT", "display": "Technical Support"},
            {"value": "CLOUD", "display": "Cloud Services"},
        ]

        created_depts = 0
        existing_depts = 0

        for dept_name in departments:
            dept, created = Department.objects.get_or_create(name=dept_name)
            if created:
                created_depts += 1
            else:
                existing_depts += 1

        created_domains = 0
        existing_domains = 0

        for domain_data in domains:
            domain, created = Domain.objects.get_or_create(
                value=domain_data["value"],
                defaults={"display": domain_data["display"]}
            )
            if created:
                created_domains += 1
            else:
                existing_domains += 1

        self.stdout.write(self.style.SUCCESS(f"Departments - Created: {created_depts}, Existing: {existing_depts}"))
        self.stdout.write(self.style.SUCCESS(f"Domains - Created: {created_domains}, Existing: {existing_domains}"))
