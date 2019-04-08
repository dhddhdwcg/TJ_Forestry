import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppState } from '../../services/app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private state: AppState
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [localStorage.getItem('userName'), [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }

  /**
   * 提交表单
   */
  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      let _value = this.validateForm.getRawValue();
      if (_value.remember) {
        localStorage.setItem('userName', _value.userName);
      } else{
        localStorage.removeItem('userName');
      }
      this.http.post('account/token', {
        loginName: _value.userName,
        password: _value.password
      }, {
        withCredentials: true
      }).subscribe((res) => {
        console.log(res);
      });
    }
  }
}
