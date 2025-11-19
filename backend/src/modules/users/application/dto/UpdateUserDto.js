/**
 * UpdateUserDto
 * Data Transfer Object for updating a user
 */
class UpdateUserDto {
  constructor() {
    this.fullName = null;
    this.email = null;
    this.password = null;
    this.role = null;
    this.class = null;
    this.major = null;
    this.faculty = null;
    this.phone = null;
    this.address = null;
    this.isActive = null;
  }

  static fromRequest(body) {
    const dto = new UpdateUserDto();
    
    if (body.fullName !== undefined) dto.fullName = body.fullName?.trim();
    if (body.email !== undefined) dto.email = body.email?.trim().toLowerCase();
    if (body.password !== undefined) dto.password = body.password;
    if (body.role !== undefined) dto.role = body.role;
    if (body.class !== undefined) dto.class = body.class;
    if (body.major !== undefined) dto.major = body.major;
    if (body.faculty !== undefined) dto.faculty = body.faculty;
    if (body.phone !== undefined) dto.phone = body.phone;
    if (body.address !== undefined) dto.address = body.address;
    if (body.isActive !== undefined) dto.isActive = body.isActive;

    return dto;
  }

  toUpdateData() {
    const data = {};
    if (this.fullName !== null) data.fullName = this.fullName;
    if (this.email !== null) data.email = this.email;
    if (this.password !== null) data.password = this.password;
    if (this.role !== null) data.role = this.role;
    if (this.class !== null) data.class = this.class;
    if (this.major !== null) data.major = this.major;
    if (this.faculty !== null) data.faculty = this.faculty;
    if (this.phone !== null) data.phone = this.phone;
    if (this.address !== null) data.address = this.address;
    if (this.isActive !== null) data.isActive = this.isActive;
    return data;
  }
}

module.exports = UpdateUserDto;

