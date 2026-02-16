from django.core.management.base import BaseCommand
from login.models import Department, Domain


class Command(BaseCommand):
    help = "List all departments and domains in the database"

    def handle(self, *args, **options):
        departments = Department.objects.all().order_by('name')
        domains = Domain.objects.all().order_by('display')
        
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("DEPARTMENTS"))
        self.stdout.write("="*80)
        
        for i, dept in enumerate(departments, 1):
            self.stdout.write(f"  {i:2}. {dept.name}")
        
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("SDC DOMAINS"))
        self.stdout.write("="*80)
        
        for i, domain in enumerate(domains, 1):
            self.stdout.write(f"  {i}. {domain.display} (value: {domain.value})")
        
        self.stdout.write("\n" + "-"*80)
        self.stdout.write(f"Total Departments: {departments.count()}")
        self.stdout.write(f"Total Domains: {domains.count()}")
        self.stdout.write("-"*80 + "\n")
