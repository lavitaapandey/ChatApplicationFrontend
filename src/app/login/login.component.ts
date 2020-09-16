import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    public title: any;
    public userForm: FormGroup;
    public resmessage: string;
    public _saveUrl: string = 'api/auth/userlogin';
    constructor(
        private router: Router,
        private titleService: Title,
        private formBuilder: FormBuilder,
        private _dataService: DataService) {
    }
    ngOnInit() {
        this.titleService.setTitle("Login");
        this.createForm();
        localStorage.removeItem("groups");
        localStorage.removeItem("users");
    }
    createForm() {
        this.userForm = this.formBuilder.group({
            userName: new FormControl('', Validators.required),
            userPass: new FormControl('', Validators.required)
        });

        //$("#userName").focus();
    }

    onSubmit() {
        if (this.userForm.invalid) {
            return;
        }

        debugger;
        this._dataService.save(this.userForm.value, this._saveUrl)
            .subscribe(response => {
                console.log(response);

                var loggeduser = response.resdata;
                if (response.resdata != null) {
                    debugger;
                    localStorage.setItem('loggedUser', JSON.stringify(loggeduser));
                    this.router.navigate(['/chat']);
                }
                else {
                    this.resmessage = "Login Faild";
                }
            }, error => {
                //console.log(error);
            });
    }


}
