import { BadRequestService } from '@qro/shared/ui-error';
import { ValidationErrorService, VALIDATION_PATTERNS, TrimmedPatternValidator } from '@qro/shared/util-forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SnackbarService } from '@qro/shared/util-snackbar';
import { ConfirmationDialogComponent } from '@qro/shared/ui-confirmation-dialog';
import { ActionDto, CaseActionDto, HealthDepartmentService } from '@qro/health-department/domain';
import { CaseType } from '@qro/auth/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { flatten } from 'lodash';

@Component({
  selector: 'qro-client-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
})
export class ActionComponent implements OnInit {
  caseAction$: Observable<CaseActionDto>;
  formGroup: FormGroup;
  caseType: CaseType;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private healthDepartmentService: HealthDepartmentService,
    private snackbarService: SnackbarService,
    private router: Router,
    private badRequestService: BadRequestService,
    private route: ActivatedRoute,
    public validationErrorService: ValidationErrorService
  ) {}

  ngOnInit() {
    this.caseAction$ = this.route.data.pipe(map((data) => data.actions));
    this.caseType = this.route.parent.snapshot.paramMap.get('type') as CaseType;

    this.formGroup = this.formBuilder.group({
      comment: new FormControl(null),
    });
  }

  submitForm(caseAction: CaseActionDto) {
    if (this.formGroup.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          abortButtonText: 'Abbrechen',
          confirmButtonText: 'ok',
          title: 'Auffälligkeiten abschließen?',
          text:
            'Möchten Sie die aktuellen Auffälligkeiten tatsächlich als abgeschlossen kennzeichnen? ' +
            'Diese werden dann in der Aktionsübersicht nicht mehr angezeigt.',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.resolveAnomalies(caseAction);
        }
      });
    }
  }

  private resolveAnomalies(caseAction: CaseActionDto) {
    this.healthDepartmentService
      .resolveAnomalies(
        caseAction._links.resolve,
        this.formGroup.controls.comment.value?.trim() || 'Auffälligkeiten geprüft und als erledigt markiert'
      )
      .subscribe(
        (_) => {
          this.snackbarService.success('Die aktuellen Auffälligkeiten wurden als erledigt gekennzeichnet');
          this.router.navigate([this.returnLink]);
        },
        (error) => {
          this.badRequestService.handleBadRequestError(error, this.formGroup);
        }
      );
  }

  hasOpenAnomalies(caseAction: CaseActionDto): boolean {
    return !!caseAction._links.resolve;
  }

  get returnLink() {
    return `/health-department/${this.caseType}-cases/action-list`;
  }

  getActionsCount(actions: ActionDto[]): number {
    if (!actions) {
      return 0;
    }
    return flatten(actions.map((a) => a.items)).length;
  }
}
