import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usuariosService: UsuariosService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usuariosService.findOneByUsername(username);
        
        if (!user) {
            return null;
        }
        if (await bcrypt.compare(pass, user.password)) { 
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { sub: user.id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(registerAuthDto: RegisterAuthDto): Promise<Usuario> {
        return this.usuariosService.create(registerAuthDto);
    }
}