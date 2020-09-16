import { Component, OnInit, ElementRef, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../shared/data.service';

import { Message } from '../shared/models/message';
declare var signalR: any;
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { GroupDetail } from '../shared/group-detail';

@Component({
  
  selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    providers: [DataService]
})
//export class ChatComponent implements OnInit {

//  constructor() { }

//  ngOnInit(): void {
//  }

//}
export class ChatComponent implements OnInit, OnDestroy {
    public title: any;
    public res: any;
    public resmessage: string;
    public loggedUserid: number = 0;
    public loggedUsername: string;
    user: boolean = true;
    public allGroups: any = [];
    dropdownList = [];

    dropdownSettings: any = {};
 
    groups: boolean;
    groupName: string;
    //API
    public _chatUrl: string = 'api/chat/userChat';
    public _groupUrl: string = 'api/chat/getAllGroups';
    public _userUrl: string = 'api/chat/getAllUsers';
    groupId: number = 0;
    
    //Chat
    public onlineUser: any = [];
    public chatUsername: string = null;
    public groupParticipants: string = null;
    public chatConnection: string;
    public chatMessages: any = [];
    public chatMessage: Message = null;
    public _hubConnection;

    constructor(
        private titleService: Title,
        public _dataService: DataService) {
        var loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
        this.loggedUsername = loggedUser.userName;
        this.loggedUserid = loggedUser.userId;

    }

    ngOnInit() {
       
        this.titleService.setTitle("Chat");
        this.signalrConn();
        debugger;
        this.AllGroups(this.loggedUserid);
        this.AllUsers();
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'userId',
            textField: 'userName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 5,
            allowSearchFilter: true
        }
        this._dataService.groupData = {
            groupId: 0,
            groupName: '',
            groupParticipants: null,
            userId: this.loggedUserid
        }
     
    };
    
    saveGroup(form: NgForm) {

        debugger;
        this._dataService.groupData.userId = this.loggedUserid;
        //if (form.value.Id == 0 || form.value.Id == null) {
        this._dataService.postGroupDetail().subscribe(
                res => {

                    this.resetForm(form);
                   alert("Group Created Successfully!")
                
                }
        )
       
        //}
        //else {

        //    this.emprecordService.putEmployeeDetail().subscribe(
        //        res => {
        //            //this.spinner.hide();
        //            this.resetForm(form);
        //            this.toastr.info('Updated Successfully', 'Employee Updated Successfully!');
        //            this.refreshList();

        //        },


        //    )

        //}

    }
    resetForm(form?: NgForm) {

        if (form != null)
            form.resetForm();
        this._dataService.groupData = {
            groupId: 0,
            groupName: '',
            groupParticipants: null,
            userId: this.loggedUserid

        }

    }
    signalrConn() {
        //Init Connection
        debugger;
        //this._hubConnection = new HubConnectionBuilder()
        //  .withUrl(window.location.href + 'MessageHub')
        //  .build();  
        this._hubConnection = new HubConnectionBuilder().withUrl("http://localhost:32770/chathub?user=" + this.loggedUsername).build();

        //Call client methods from hub to update User
        //this._hubConnection.on('UpdateUserList', (onlineuser) => {
        //  debugger;
        //  var users = JSON.parse(onlineuser);
        //  this.onlineUser = [];
        //  for (var key in users) {
        //    if (users.hasOwnProperty(key)) {
        //      if (key !== this.loggedUsername) {
        //        this.onlineUser.push({
        //          userName: key,
        //          connection: users[key]
        //        });
        //      }
        //    }
        //  }
        //});

        //Call client methods from hub to update User
        this._hubConnection.on('ReceiveMessage', (message: Message) => {
            debugger;
           
            if (message.isGroup == true) {
                this.chatGroupLog();
                if (this.groupName != null || this.groupName != "") {

                }
                this.chatUsername = this.groupName;
            }
            else {
                this.chatLog();
                this.chatUsername = message.senderid;
            }


        });

        //Start Connection
        this._hubConnection
            .start()
            .then(function () {
                console.log("Connected");
            }).catch(function (err) {
                return console.error(err.toString());
            });
    }

    

    sendMessage(message) {
        debugger;
        if (this.chatUsername == null || this.chatUsername == "") {
            alert("Please choose any group or user to chat");
        }
        else {
            if (message != '') {
                this.chatMessage = new Message();
                this.chatMessage.senderid = this.loggedUsername;
                if (this.groupParticipants != null) {
                    this.chatMessage.isGroup = true;
                    this.chatMessage.IsPrivate = false;
                    this.chatMessage.receiverid = this.groupParticipants;
                    this.chatMessage.groupId = this.groupId;

                }
                else {
                    this.chatMessage.receiverid = this.chatUsername;
                }
                this.chatMessage.message = message;
                this.chatMessage.messagestatus = "sent";
                this.chatMessages.push(this.chatMessage);
                this._hubConnection.invoke('SendMessage', this.chatMessage);
            }
        }
        //Send Message
      
    }

    chooseUser(user) {
        this.chatUsername = user.userName;
        this.chatLog();
    }
    chooseGroup(group) {
        debugger;
        this.groupName = group.groupName;
        this.chatUsername = group.groupName;
        this.groupId = group.groupId;
        this.groupParticipants = group.groupParticipants;
        var separator = ",";
        var values = group.groupParticipants.split(separator);
        for (var i = 0; i < values.length; i++) {
            if (values[i] == this.loggedUserid) {
                values.splice(i, 1);
                this.groupParticipants = values.join(separator);
            }
        }

        this.chatGroupLog();
        //this.chatLog();
    }
    Users() {
        this.user = true;
        this.groups = false;
    }
    Group() {
        this.user = false;
        this.groups = true;
    }
    AllGroups(userID) {

        this._dataService.get(this._groupUrl + '?userID=' + userID)
            .subscribe(
                response => {
                    debugger;
                    this.res = response;
                    if (this.res != null) {

                        this.allGroups = this.res.resdata;
                        //localStorage.setItem('groups', JSON.stringify(this.allGroups));
                        

                    }
                }, error => {
                    console.log(error);
                }
            );
    }
    AllUsers() {

        this._dataService.get(this._userUrl)
            .subscribe(
                response => {
                    debugger;
                    this.res = response;
                    if (this.res != null) {
                        var allusers = [];
                        allusers = this.res.resdata;
                        this.onlineUser = allusers.filter(item => item.userId != this.loggedUserid);
                        this.dropdownList = this.onlineUser;
                        //localStorage.setItem('users', JSON.stringify(this.onlineUser));

                    }
                }, error => {
                    console.log(error);
                }
            );
    }
    chatGroupLog() {
        //ChatLog
        debugger;
        var param = { Senderid: this.loggedUsername, Receiverid: this.groupParticipants, groupId: this.groupId };
        var getchatUrl = this._chatUrl + '?param=' + JSON.stringify(param);
        this._dataService.get(getchatUrl)
            .subscribe(
                response => {
                    this.res = response;
                    if (this.res != null) {
                        var chatLog = this.res.resdata;
                        this.chatMessages = [];
                        if (chatLog.length > 0) {
                            for (var i = 0; i < chatLog.length; i++) {
                                if (this.loggedUsername === chatLog[i].senderid) {
                                    chatLog[i].messagestatus = "sent";
                                }
                                else {
                                    chatLog[i].messagestatus = "received";
                                }

                                //Push-Data
                                this.chatMessages.push(chatLog[i]);
                            }
                        }
                    }
                }, error => {
                    console.log(error);
                }
            );
    }
    chatLog() {
        //ChatLog
        var param = { Senderid: this.loggedUsername, Receiverid: this.chatUsername };
        var getchatUrl = this._chatUrl + '?param=' + JSON.stringify(param);
        this._dataService.get(getchatUrl)
            .subscribe(
                response => {
                    this.res = response;
                    if (this.res != null) {
                        var chatLog = this.res.resdata;
                        this.chatMessages = [];
                        if (chatLog.length > 0) {
                            for (var i = 0; i < chatLog.length; i++) {
                                if (this.loggedUsername === chatLog[i].senderid) {
                                    chatLog[i].messagestatus = "sent";
                                }
                                else {
                                    chatLog[i].messagestatus = "received";
                                }

                                //Push-Data
                                this.chatMessages.push(chatLog[i]);
                            }
                        }
                    }
                }, error => {
                    console.log(error);
                }
            );
    }

    ngOnDestroy() {
        //Stop Connection
        this._hubConnection
            .stop()
            .then(function () {
                console.log("Stopped");
            }).catch(function (err) {
                return console.error(err.toString());
            });
    }
}
