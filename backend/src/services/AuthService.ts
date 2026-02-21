import UserRepository from '../repositories/UserRepository';
import CompanyRepository from '../repositories/CompanyRepository';
import { CryptoUtil } from '../utils/crypto';
import { RegisterDTO, LoginDTO, AuthResponse, UserDTO } from '../types/auth.types';

class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    const passwordHash = await CryptoUtil.hashPassword(data.password);

    let name: string;
    if (data.role === 'candidate') {
      if (!data.firstName || !data.lastName) {
        throw new Error('Họ và tên là bắt buộc cho ứng viên');
      }
      name = `${data.firstName} ${data.lastName}`;
    } else if (data.role === 'employer') {
      if (!data.companyName || !data.taxCode || !data.industry) {
        throw new Error('Tên công ty, mã số thuế và ngành nghề là bắt buộc cho nhà tuyển dụng');
      }
      name = data.companyName;

      const existingCompany = await CompanyRepository.findByTaxCode(data.taxCode);
      if (existingCompany) {
        throw new Error('Mã số thuế đã được sử dụng');
      }
    } else {
      throw new Error('Role không hợp lệ');
    }

    const status = data.role === 'candidate' ? 'active' : 'pending';

    const user = await UserRepository.create({
      email: data.email,
      name,
      role: data.role,
      phone: data.phone,
      passwordHash,
      status
    });

    if (data.role === 'employer' && data.companyName && data.taxCode && data.industry) {
      await CompanyRepository.create({
        name: data.companyName,
        taxCode: data.taxCode,
        industry: data.industry,
        userId: user.id
      });
    }

    const token = status === 'active'
      ? CryptoUtil.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })
      : '';

    return {
      token,
      user: this.toUserDTO(user),
      message: status === 'pending'
        ? 'Đăng ký thành công. Vui lòng chờ admin duyệt tài khoản.'
        : 'Đăng ký thành công.'
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    let user = await UserRepository.findByEmail(data.identifier);
    if (!user) {
      user = await UserRepository.findByPhone(data.identifier);
    }

    if (!user) {
      throw new Error('Email/SĐT hoặc mật khẩu không đúng');
    }

    // Load companies separately since findByEmail/Phone might not include it
    const userWithCompanies = await UserRepository.findById(user.id);
    if (!userWithCompanies) throw new Error('User not found after login');
    user = userWithCompanies;

    console.log('Login attempt:', { identifier: data.identifier, userFound: !!user, status: user?.status, role: user?.role });
    if (user.status === 'deleted') {
      throw new Error('Tài khoản đã bị xóa');
    }
    if (user.status === 'locked') {
      throw new Error('Tài khoản đã bị khóa');
    }
    if (user.status === 'pending') {
      throw new Error('Tài khoản chưa được admin duyệt');
    }

    const isValid = await CryptoUtil.comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Email/SĐT hoặc mật khẩu không đúng');
    }

    const token = CryptoUtil.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: this.toUserDTO(user)
    };
  }

  private toUserDTO(user: any): UserDTO {
    const userData = user.toJSON ? user.toJSON() : user;
    const company = userData.companies && userData.companies.length > 0 ? userData.companies[0] : undefined;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      company: company ? {
        id: company.id,
        name: company.name,
        taxCode: company.taxCode,
        industry: company.industry,
        logoUrl: company.logoUrl,
        description: company.description
      } : undefined
    };
  }
}

export default new AuthService();
