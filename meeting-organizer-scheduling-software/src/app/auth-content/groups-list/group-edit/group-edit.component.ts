import { Component, OnInit } from '@angular/core';
import { Group } from 'src/app/models/group';
import { GroupService } from 'src/app/services/group/group.service';
import { UserService } from 'src/app/services/user/user.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, first } from 'rxjs/operators';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.css']
})
export class GroupEditComponent implements OnInit {

  editButton = faEdit;
  addButton = faPlus;
  deleteButton = faTrash;

  groupBeingEdited: Group;
  currentUser: User;

  loading: boolean;
  searching: boolean;
  submitted = false;
  groupEditForm: FormGroup;
  members_to_be_added: Map<string, User>;
  memberToBeAddedNameFilter: string;
  userSearchResult$: Observable<User[]>;
  userSearchResult: User[];
  private userSearchList = new Subject<string>();

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService
    )
    {
      this.currentUser = authService.currentUserValue;
    }


  ngOnInit() {
    this.groupBeingEdited = {_id: "", name: "", members: []};

    // populate groupsBeingEdited
    this.activatedRoute.url.subscribe(
      segment => {
        if (segment[1].path == "edit" && segment[2] != undefined) {
          this.groupService.getGroup(segment[2].path).subscribe(
            group => {
              this.groupBeingEdited = group;
              let groupMembers = group.members as Object as User[];
              groupMembers.forEach(member => this.members_to_be_added.set(member.email, member));
              console.log(this.members_to_be_added);
            },
            error => {
              this.alertService.error("Error while fetching group");
              this.router.navigate(['/groups']);
            }
          );
        }
        else {
          this.router.navigate(['/groups']);
        }
      }
    )

    this.members_to_be_added = new Map<string, User>();
    this.searching = false;
    this.userSearchResult = [];
    this.memberToBeAddedNameFilter = "";
    this.userSearchResult$ = of([]);
    // https://angular.io/tutorial/toh-pt6#add-search-to-the-dashboard
    this.userSearchResult$ = this.userSearchList.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.userService.searchUser(term)),
    );

    // Initialize form
    this.groupEditForm = this.formBuilder.group({
      name: ['']
    });
  }

  onSubmit() {
    this.submitted = true;

    // reset alertservice
    this.alertService.clear();

    this.loading = true;

    // Create a new group object without an id (doesn't get processed by the server anyways) and a stringified list of members
    var groupToBeEdited: Group = {
      _id: this.groupBeingEdited._id,
      name: this.f.name.value === '' ? this.groupBeingEdited.name : this.f.name.value,
      members: this.convertListToIDs(this.members_to_be_added)};
    // Add the group
    this.groupService.updateGroup(groupToBeEdited)
        .pipe(first())
        .subscribe(
          data => {
            this.alertService.success('Group edited successfully', true);
            this.router.navigateByUrl('/groups');
          },
          error => {
            this.alertService.error('Error while editing group');
            this.loading = false;
          }
        );
  }
  // convenience getter for easy access to form fields
  get f() { return this.groupEditForm.controls; }

  // Simple function to convert a list of users into a list of their ids only
  convertListToIDs(users: Map<string, User>): string[] {
    let list: string[] = [];
    // Only grabs the user and ignores email part
    users.forEach(user => {
      list.push(user._id);
    });
    return list;
  }

  // Function that adds to a list of search terms that gets processed every 300ms in order to not spam the server
  searchInvitees(term: string) {
    if (!term.trim()) {
      this.searching = false;
      return;
    }
    this.searching = true;
    this.userSearchList.next(term);
  }

  // Simply adds a user to the visual list
  addToList(user: User) {
    this.members_to_be_added.set(user.email, user);
  }

  // Simple removes a user from the visual list
  removeFromList(user: User) {
    this.members_to_be_added.delete(user.email);
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
}
