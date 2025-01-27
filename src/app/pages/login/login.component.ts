import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginDTO } from '../../interface/login.dto';
import { TokenDTO } from '../../interface/token.dto';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData: LoginDTO = this.loginForm.value;

      this.authService.iniciarSesion(loginData).subscribe({
        next: (response: { error: boolean; respuesta: TokenDTO }) => {
          if (!response.error && response.respuesta && response.respuesta.token) {
            this.tokenService.login(response.respuesta.token);
            this.showAlert('Inicio de sesión exitoso', 'success');

          } else {
            this.showAlert('Error en la respuesta del servidor', 'danger');
          }
        },
       error: (err) => {
  console.error('Error al iniciar sesión', err);
  if (err.status === 401) {
    this.showAlert('Credenciales incorrectas. Por favor, intente de nuevo.', 'danger');
  } else if (err.status === 423) {
    this.showAlert('Ha alcanzado el número máximo de intentos fallidos. Su cuenta ha sido bloqueada.', 'danger');
  } else {
    this.showAlert('Error al iniciar sesión. Por favor, intente más tarde.', 'danger');
  }
}

      });
    } else {
      this.showAlert('Formulario no válido. Por favor verifica los campos.', 'danger');
    }
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    if (type === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: message,
        confirmButtonText: 'Aceptar'
      });
    } else if (type === 'danger') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
      });
    }
  }
}
