import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { EnrollmentService } from '../data-access/enrollment.service';
import { EncounterEntry } from '../model/encounter';

@Injectable()
export class EncountersResolver implements Resolve<EncounterEntry[]> {
  constructor(private enrollmentService: EnrollmentService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<EncounterEntry[]> {
    return this.enrollmentService.getEncounters();
  }
}
