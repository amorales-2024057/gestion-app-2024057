import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { LoginRequest, LoginResponse, UsuarioPublico } from '../models/usuario.model';

const CLAVE_TOKEN = 'finanzas_token';
const CLAVE_USUARIO = 'finanzas_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly usuarioActual = signal<UsuarioPublico | null>(this.cargarUsuarioGuardado());
    readonly usuario = this.usuarioActual.asReadonly();

    constructor(private readonly http: HttpClient) {}

    login(credenciales: LoginRequest): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${API_BASE_URL}/auth/login`, credenciales)
            .pipe(
                tap((respuesta) => {
                    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
                    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
                    this.usuarioActual.set(respuesta.usuario);
                })
            );
    }

    logout(): void {
        localStorage.removeItem(CLAVE_TOKEN);
        localStorage.removeItem(CLAVE_USUARIO);
        this.usuarioActual.set(null);
    }

    obtenerToken(): string | null {
        return localStorage.getItem(CLAVE_TOKEN);
    }

    estaAutenticado(): boolean {
        return !!this.obtenerToken();
    }

    private cargarUsuarioGuardado(): UsuarioPublico | null {
        const datosGuardados = localStorage.getItem(CLAVE_USUARIO);
        if (!datosGuardados) {
            return null;
        }

        try {
            return JSON.parse(datosGuardados) as UsuarioPublico;
        } catch {
            return null;
        }
    }
}
