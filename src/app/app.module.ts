import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
//import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { DataService } from './shared/data.service';
import { ChatComponent } from './chat/chat.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
      AppRoutingModule,
      BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
      HttpClientModule,
      FormsModule,
      HttpModule,
      ReactiveFormsModule,
      CommonModule,
      NgMultiSelectDropDownModule.forRoot(),

      RouterModule.forRoot([

          { path: 'chat', component: ChatComponent },

      ])
  ],
    providers: [DataService],
    bootstrap: [AppComponent],
    exports: [RouterModule]
})
export class AppModule { }
