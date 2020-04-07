import { Component, OnInit } from '@angular/core';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { GroupService } from 'src/app/services/group/group.service';
import { User } from 'src/app/models/user';
import { Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, first } from 'rxjs/operators';
import { async } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert/alert.service';
import { Group } from 'src/app/models/group';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.css']
})
export class GroupCreateComponent implements OnInit {

  currentUser: User;

  // Visual buttons by FontAwesome
  deleteButton = faTrash;
  addButton = faPlus;

  // Form validation / loading stuff
  groupCreationForm: FormGroup;
  submitted = false;
  invalidName;
  loading: boolean;
  
  // User search stuff
  searching: boolean;
  members_to_be_added: Map<string, User>;
  memberToBeAddedNameFilter: string;
  userSearchResult$: Observable<User[]>;
  userSearchResult: User[];
  private userSearchList = new Subject<string>();
  

  constructor(
    private authService : AuthService,
    private userService: UserService,
    private groupService: GroupService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private router: Router)
    {
      this.currentUser = authService.currentUserValue;
    }

  ngOnInit() {
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
    this.groupCreationForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.groupCreationForm.controls; }

  // When pressing submit, this gets called
  onSubmit() {
    this.invalidName = this.f.name.errors;
    this.submitted = true;

    // reset alertservice
    this.alertService.clear();

    // stop if form invalid or no members added
    if (this.groupCreationForm.invalid) {
      return;
    }
    else if(this.members_to_be_added.size == 0) {
      this.alertService.error('Group has no members', true);
      return;
    }

    this.loading = true;

    // Create a new group object without an id (doesn't get processed by the server anyways) and a stringified list of members
    var groupToBeAdded: Group = {_id: "", name: this.f.name.value, members: this.convertListToIDs(this.members_to_be_added)};
    // Add the group
    this.groupService.addGroup(groupToBeAdded)
        .pipe(first())
        .subscribe(
          data => {
            this.alertService.success('Group added successfully', true);

            // Add newly created group to user
            let newGroup: Group = data as Group;
            console.log(this.authService.currentUserValue);
            this.userService.addGroupToUser(newGroup._id, this.authService.currentUserValue)
              .subscribe(
                data => {
                  // Update local version of user
                  this.authService.updateCurrentUser();
                  // Navigate back to the group list
                  this.router.navigateByUrl('/groups');
                },
                error => {
                  this.alertService.error('Error while fetching group');
                }
              )
          },
          error => {
            this.alertService.error('Error while creating group');
            this.loading = false;
          }
        );
  }

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
