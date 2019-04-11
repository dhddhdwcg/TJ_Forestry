import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface MissionType {
	type: string;
	value: any
}

@Injectable()
export class MissionService {
 
  // Observable string sources
  private missionAnnouncedSource = new Subject<MissionType>();
  private missionConfirmedSource = new Subject<MissionType>();
 
  // Observable string streams
  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
  missionConfirmed$ = this.missionConfirmedSource.asObservable();
 
  // Service message commands
  announceMission(mission: MissionType) {
    this.missionAnnouncedSource.next(mission);
  }
 
  confirmMission(astronaut: MissionType) {
    this.missionConfirmedSource.next(astronaut);
  }
}