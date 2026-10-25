import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonNote,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { SiperilHeaderComponent } from '../../shared/layout/siperil-header.component';
import { SiperilLogoComponent } from '../../shared/brand/siperil-logo.component';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonNote,
    IonButton,
    IonSpinner,
    SiperilHeaderComponent,
    SiperilLogoComponent,
  ],
})
export class AuthPage {
  isLogin: boolean = true;
  loading: boolean = false;

  form = this.fb.nonNullable.group({
    name: [''],
    // correo y clave siempre se validan, nombre y empresa solo en registro
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    employeeNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastController,
  ) {}

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    const name = this.form.controls.name;
    const company = this.form.controls.company;
    const employeeNumber = this.form.controls.employeeNumber;
    if (this.isLogin) {
      name.clearValidators();
      company.clearValidators();
      employeeNumber.clearValidators();
    } else {
      // en registro nombre, empresa y numero pasan a ser obligatorios
      name.setValidators([Validators.required, Validators.minLength(2)]);
      company.setValidators([Validators.required, Validators.minLength(2)]);
      employeeNumber.setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(30)]);
    }
    name.updateValueAndValidity();
    company.updateValueAndValidity();
    employeeNumber.updateValueAndValidity();
  }

  async submit(): Promise<void> {
    // si falta un campo no llama al api
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { name, email, company, employeeNumber, password } = this.form.getRawValue();
    try {
      if (this.isLogin) {
        // login guarda la sesion y entra al inicio reemplazando el historial
        await this.auth.login(email, password);
        const t = await this.toast.create({
          message: 'Sesión iniciada.',
          duration: 1800,
          color: 'success',
        });
        await t.present();
        await this.router.navigateByUrl('/home', { replaceUrl: true });
      } else {
        // el registro no abre sesion, vuelve al formulario de login
        await this.auth.register({ name, email, company, employeeNumber, password });
        const t = await this.toast.create({
          message: 'Cuenta creada. Ya puedes iniciar sesión.',
          duration: 2500,
          color: 'success',
        });
        await t.present();
        this.isLogin = true;
      }
    } catch {
      // el interceptor muestra el error
    } finally {
      this.loading = false;
    }
  }
}
