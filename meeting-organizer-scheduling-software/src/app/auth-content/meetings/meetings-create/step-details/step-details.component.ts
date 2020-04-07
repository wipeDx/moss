import { Component, OnInit, Input } from '@angular/core';
import { faTrash, faPlus, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { User } from 'src/app/models/user';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { GroupService } from 'src/app/services/group/group.service';
import { Group, PopulatedGroup } from 'src/app/models/group';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Attendee, Priority } from 'src/app/models/attendee';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-step-details',
  templateUrl: './step-details.component.html',
  styleUrls: ['./step-details.component.css']
})
export class StepDetailsComponent implements OnInit {

  iconDelete = faTrash;
  iconChooseTimes = faCalendarAlt;

  currentUser: User;
  isEditing: boolean;

  meetingDetailsForm: FormGroup;

  // Visual buttons by FontAwesome
  deleteButton = faTrash;
  addButton = faPlus;

  repeating: boolean;

  // User search stuff
  searching: boolean;
  members_to_be_added: Map<string, User>;
  members_to_be_added_as_attendee: Map<string, Attendee>; // oh dear, this is done to reflect the Attendee model instead of a user
                                                          // the other map is still kept because of email showing capabilities
  memberToBeAddedNameFilter: string;
  userSearchResult$: Observable<User[]>;
  userSearchResult: User[];
  groupSearchResult$: Observable<Group[]>;
  groupSearchResult: Group[];
  private userSearchList = new Subject<string>();
  private groupSearchList = new Subject<string>();

  constructor(
    private authService : AuthService,
    private userService: UserService,
    private groupService: GroupService,
    private meetingService: MeetingsService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
    ) 
    {
      this.currentUser = authService.currentUserValue;

    }

  ngOnInit() {
    console.log(this.isEditing);
    this.meetingDetailsForm = this.formBuilder.group({
      name: ['', Validators.required],
      location: [''],
      comment: [''],
      repeating: [''],
      repeatingCount: new FormControl({value: '', disabled: true}),
      repeatingInterval: new FormControl({value: 'Choose...', disabled: true})
    });
    this.loadValues();
    
    //this.repeating = false;
    this.searching = false;
    this.userSearchResult = [];
    this.groupSearchResult = [];
    this.memberToBeAddedNameFilter = "";
    this.userSearchResult$ = of([]);
    this.groupSearchResult$ = of([]);
    // https://angular.io/tutorial/toh-pt6#add-search-to-the-dashboard
    this.userSearchResult$ = this.userSearchList.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.userService.searchUser(term)),
    );
    this.groupSearchResult$ = this.groupSearchList.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.userService.searchUserGroups(term, this.authService.currentUserValue)),
    );

    this.isEditing = this.checkIsEditing();
    if (this.isEditing && !this.meetingService.editFetchedInitialMeeting) {
      this.onInitIsEditing();
    }
  }

  /**
   * Checks whether the url contains editing und thus returns true or false
   */
  checkIsEditing() {
    return window.location.href.includes('meetings/edit/');
  }

  onInitIsEditing() {
    const meetingID = window.location.href.split("/meetings/edit/")[1].split('/')[0];
    this.meetingService.getMeeting(meetingID).subscribe(
      meeting => {
        this.meetingService.parseMeeting(meeting);
        this.meetingService.changeMeetingToEdit(meeting);
        this.loadValues();
        this.meetingService.changeEditFetchedInitialMeeting(true);
      }
    )
  }

  loadValues() {
    this.meetingDetailsForm.controls.name.setValue(this.meetingService.eventName.value);
    this.meetingDetailsForm.controls.location.setValue(this.meetingService.eventLocation.value);
    this.meetingDetailsForm.controls.comment.setValue(this.meetingService.commentBox.value);
    this.meetingDetailsForm.controls.repeating.setValue(this.meetingService.repeating.value);
    this.meetingDetailsForm.controls.repeatingCount.setValue(this.meetingService.repeatingCount.value);
    this.meetingDetailsForm.controls.repeatingInterval.setValue(this.meetingService.repeatingInterval.value);
    this.members_to_be_added = this.meetingService.addedMembersUser.value;
    this.members_to_be_added_as_attendee = this.meetingService.addedMembersAttendee.value;
    this.toggleRepeating();
  }

  onSubmit() {
    this.meetingService.changeCommentBox(this.meetingDetailsForm.controls.comment.value);
    this.meetingService.changeEventName(this.meetingDetailsForm.controls.name.value);
    this.meetingService.changeEventLocation(this.meetingDetailsForm.controls.location.value);
    this.meetingService.changeRepeating(this.meetingDetailsForm.controls.repeating.value);
    this.meetingService.changeRepeatingCount(this.meetingDetailsForm.controls.repeatingCount.value);
    this.meetingService.changeRepeatingInterval(this.meetingDetailsForm.controls.repeatingInterval.value);
    this.meetingService.changeAddedMembersUser(this.members_to_be_added);
    this.meetingService.changeAddedMembersAttendee(this.members_to_be_added_as_attendee);
  }

  toggleRepeating() {
    if (this.meetingDetailsForm.controls.repeating.value) {
      this.meetingDetailsForm.controls.repeatingCount.enable();
      this.meetingDetailsForm.controls.repeatingInterval.enable();
    }
    else {
      this.meetingDetailsForm.controls.repeatingCount.disable();
      this.meetingDetailsForm.controls.repeatingInterval.disable();
    }
  }

  // Function that adds to a list of search terms that gets processed every 300ms in order to not spam the server
  searchInvitees(term: string) {
    if (!term.trim()) {
      this.searching = false;
      return;
    }
    this.searching = true;
    this.groupSearchList.next(term);
    this.userSearchList.next(term);
  }

  // Simply adds a group to the visual list by looping through it
  addGroupToList(group: PopulatedGroup) {
    this.changedInput()
    group.members.forEach(user => {
      this.members_to_be_added.set(user.email, user);
      this.members_to_be_added_as_attendee.set(user.email, this.generateAttendeeFromUser(user));
    });
    this.meetingService.changeFetchedForeignCalendars(false);
  }

  changedInput() {
    this.meetingService.changeHasInputChanged();
  }

  changePriority(user: User, value: string) {
    switch (value) {
      case "1":
        this.members_to_be_added_as_attendee.get(user.email).priority = Priority.MOST_IMPORTANT;
        break;
      case "3":
        this.members_to_be_added_as_attendee.get(user.email).priority = Priority.NOT_IMPORTANT;
        break;
      default:
        this.members_to_be_added_as_attendee.get(user.email).priority = Priority.NORMAL;
        break;
    }
    this.meetingService.changeFetchedForeignCalendars(false);
  }

  generateAttendeeFromUser(user: User): Attendee {
    let atemptee = new Attendee; //heh
    atemptee.userID = user._id;
    return atemptee;
  }

  // Simply adds a user to the visual list and sets fetched calendars to false
  addToList(user: User) {
    this.members_to_be_added.set(user.email, user);
    this.members_to_be_added_as_attendee.set(user.email, this.generateAttendeeFromUser(user));
    this.meetingService.changeFetchedForeignCalendars(false);
  }

  // Simple removes a user from the visual list and sets fetched calendars to false
  removeFromList(user: User) {
    this.members_to_be_added.delete(user.email);
    this.members_to_be_added_as_attendee.delete(user.email);
    this.meetingService.changeFetchedForeignCalendars(false);
  }

  filteredMembersToBeAdded(keyvalue) {

    return keyvalue.filter(entry => {
      if (this.memberToBeAddedNameFilter === "") {
        return true;
      }
      else {
        let lowerCase = entry.value.name.toLowerCase();
        return lowerCase.includes(this.memberToBeAddedNameFilter.toLowerCase());
      }
    })
  }

  /**
   * Checks the priority of the underlying object against the priority of the select box in HTML
   * @param value Priority of selection
   */
  checkPriority(value, priority) {
    return this.members_to_be_added_as_attendee.get(value.email).priority === priority;
  }

}
