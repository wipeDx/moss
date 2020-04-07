import { Component, OnInit } from '@angular/core';
import { faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Group } from 'src/app/models/group';
import { GroupService } from 'src/app/services/group/group.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css']
})
export class GroupsListComponent implements OnInit {

  deleteButton = faTrash;
  iconAdd = faPlus;
  cancelButton = faTimes;

  groupToDelete: Group;
  loading: boolean;

  groups: Group[];
  groupNameFilter: string;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private alertService: AlertService,
    private authService: AuthService)
    { }

  ngOnInit() {
    this.loadGroups();
    this.groupToDelete = {_id: "-1", name: "", members: []};
    this.groupNameFilter = ""
    this.groups = [];
    this.loading = false;
  }

  // Updates the group variable in order to reuse the same modal in the HTML
  updateGroupToDelete(group: Group) {
    this.groupToDelete = group == undefined ? {_id: "-1", name: "", members: []} : group;
  }

  loadGroups() {
    this.groupService.getGroups().subscribe(
      group => {
        this.groups = group;
      },
      error => this.alertService.error(`Error while fetching your groups`)
    );
  }

  filteredGroups() {
    return this.groups.filter(group => {
      if (this.groupNameFilter === "") {
        return true;
      }
      else {
        let lowerCase = group.name.toLowerCase();
        return lowerCase.includes(this.groupNameFilter.toLowerCase());
      }
    })
  }

  // Deletes group string from user, the group itself and updates the local storage user
  deleteGroup(group: Group) {
    this.loading = true;
    
    this.groupService.deleteGroup(group).subscribe(
      data => {
        this.userService.deleteGroupFromUser(group._id, this.authService.currentUserValue).subscribe(
          data => {
            this.authService.updateCurrentUser();
            this.alertService.success(`Group successfully deleted`);
            document.getElementById('modalDeleteGroupButtonClose').click();
            // Reset string
            this.groupToDelete = {_id: "-1", name: "", members: []};
    
           // Reload groups
           this.loadGroups();

           this.loading = false;
          },
          error => {
            this.alertService.error(`Error during deletion of group`);
          }
        );
      },
      error => {
        this.alertService.error(`Error during deletion of group`);
      }
    );

  }

}
