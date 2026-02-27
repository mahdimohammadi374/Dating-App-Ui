import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IUser } from '../_models/account.models';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  currentUser$:Observable<IUser | null>;
  form: FormGroup = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(public accountService: AccountService ,
     private router:Router,
      private toast:ToastrService
    ) {}
  ngOnInit(): void {
   this.currentUser$ = this.accountService.currentUser$;
  }



  onSubmit() {
    console.log("clicked");
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
    this.accountService.login(this.form.value).subscribe({
      next: (respnse) => {
        console.log("response");
        
        // this.router.navigateByUrl("/members")
        // this.toast.success( "you logged in successfully","success" )
      }
    });
  }
  logout() {
    this.accountService.logout();
    this.form.reset();
    this.router.navigate(["/"])

  }
 
}
