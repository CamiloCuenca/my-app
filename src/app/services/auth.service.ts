import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { LoginDTO } from '../interface/login.dto';
import { TokenDTO } from '../interface/token.dto';
import { dtoAccountInformation } from '../interface/dtoAccountInformation';
import { MessageDTO } from '../interface/MessageDTO';
import { TokenService } from './token.service';
import { editAccountDTO } from '../interface/editAccountDTO';
import { updatePasswordDTO } from '../interface/updatePasswordDTO';
import { RecoverPasswordDTO } from '../interface/RecoverPasswordDTO';
import { PasswordDTO } from '../interface/PasswordDTO';
import { ActiveAccountDTO } from '../interface/ActiveAccountDTO';
import { cartDetailDTO } from '../interface/cartDetailDTO';

interface LoginResponse {
  error: boolean;
  respuesta: TokenDTO; // Aquí especificamos que 'respuesta' es de tipo TokenDTO
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://unieventos-proyecto-final-backend-49t8.onrender.com/api/auth';

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getUserData(): Observable<MessageDTO<dtoAccountInformation>> {
    const userId = this.tokenService.getIDCuenta(); // Obtén el ID del token
    return this.http.get<MessageDTO<dtoAccountInformation>>(
      `https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/cuenta/obtener-info/${userId}`
    );
  }

  editAccount(
    accountData: editAccountDTO,
    userId: string
  ): Observable<MessageDTO<string>> {
    return this.http.put<MessageDTO<string>>(
      `https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/cuenta/editar-perfil/${userId}`,
      accountData
    );
  }

  updatePassword(
    passwordData: updatePasswordDTO,
    userId: string
  ): Observable<MessageDTO<string>> {
    return this.http.put<MessageDTO<string>>(
      `https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/cuenta/editar-password/${userId}`,
      passwordData
    );
  }

  sendActiveCode(correo: string): Observable<any> {
    return this.http.post<any>(
      `https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/email/enviar-codigoActive/${correo}`,
      {}
    );
  }


  recoverPassword(correo: string): Observable<any> {
    return this.http.post<any>(
      `https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/email/enviar-codigo/${correo}`,
      {}
    );
  }

  iniciarSesion(loginData: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/cuenta/iniciar-sesion`,
      loginData
    );
  }

  cambiarContrasena(
    passwordData: RecoverPasswordDTO,
    userId: string
  ): Observable<MessageDTO<string>> {
    return this.http.put<MessageDTO<string>>(
      `https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/cuenta/cambiar-password/${userId}`,
      passwordData
    );
  }

  deleteAccount(userId: string, passwordDTO: PasswordDTO): Observable<MessageDTO<string>> {
    return this.http.post<MessageDTO<string>>(`https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/cuenta/eliminar/${userId}`, passwordDTO);
  }


  changePassword(recoverPasswordDTO: RecoverPasswordDTO): Observable<MessageDTO<string>> {
    // Aquí se pasa el tipo MessageDTO<string> porque la respuesta es un string (mensaje)
    return this.http.put<MessageDTO<string>>(`https://unieventos-proyecto-final-backend-49t8.onrender.com/api/cliente/cuenta/cambiar-password`, recoverPasswordDTO);
  }

  activateAccount(activeAccountDTO: ActiveAccountDTO): Observable<MessageDTO<string>> {
    // Aquí se pasa el tipo MessageDTO<string> porque la respuesta es un string (mensaje)
    return this.http.post<MessageDTO<string>>(`https://unieventos-proyecto-final-backend-49t8.onrender.com/api/auth/cuenta/activar-cuenta`, activeAccountDTO);
  }

  crearCuenta(datos: any): Observable<any> {
    return this.http
      .post('https://unieventos-proyecto-final-backend-49t8.onrender.com/api/auth/cuenta/crear-cuenta', datos)
      .pipe(
        catchError(this.handleError) // Captura y maneja errores
      );
  }

  addItemToCart(userId: string, cartDetailDTO: cartDetailDTO): Observable<any> {
    return this.http.post<MessageDTO<string>>(`http://localhost:8080/api/cliente/carrito/agregar-item/${userId}`,cartDetailDTO);
    
  }




  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.message) {
        // Asegúrate de que el backend devuelva un mensaje en error.error.message
        errorMessage = error.error.message; // Extraer el mensaje específico del cuerpo de la respuesta
      } else {
        switch (error.status) {
          case 409: // Conflicto: Email ya existe
            errorMessage = 'El correo electrónico ya está en uso.';
            break;
          case 400: // Solicitud incorrecta: Cédula ya existe
            errorMessage = 'El número de identificación ya está en uso.';
            break;
          default:
            errorMessage = 'Error en la solicitud.';
            break;
        }
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
