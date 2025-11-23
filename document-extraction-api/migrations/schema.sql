-- Create Database
CREATE DATABASE document_extraction_db;

-- Connect to the database
\c document_extraction_db;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100),
    action VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles Table (Many-to-Many)
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Role Permissions Table (Many-to-Many)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Product Master Table
CREATE TABLE product_master (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    description TEXT,
    country_of_origin VARCHAR(100),
    manufacturer_id INTEGER,
    product_price DECIMAL(10, 2),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product Specification Table
CREATE TABLE product_specification (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product_master(id) ON DELETE CASCADE,
    specification_name VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    other_terms TEXT,
    product_specification_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Upload History Table
CREATE TABLE upload_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_path VARCHAR(500),
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_product_master_model_name ON product_master(model_name);
CREATE INDEX idx_product_spec_product_id ON product_specification(product_id);

-- Insert Default Roles
INSERT INTO roles (role_name, description, is_active) VALUES
('Admin', 'Full system access', TRUE),
('Editor', 'Can create and edit products', TRUE),
('Viewer', 'Can only view products', TRUE),
('Uploader', 'Can upload documents', TRUE);

-- Insert Default Permissions
INSERT INTO permissions (permission_name, description, resource, action, is_active) VALUES
('create_product', 'Create new product', 'product', 'create', TRUE),
('read_product', 'Read product data', 'product', 'read', TRUE),
('update_product', 'Update product data', 'product', 'update', TRUE),
('delete_product', 'Delete product data', 'product', 'delete', TRUE),
('upload_document', 'Upload documents', 'document', 'create', TRUE),
('manage_roles', 'Manage roles and permissions', 'role', 'manage', TRUE),
('manage_users', 'Manage users', 'user', 'manage', TRUE),
('view_reports', 'View system reports', 'report', 'read', TRUE);

-- Assign Permissions to Admin Role
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.role_name = 'Admin' AND p.is_active = TRUE;

-- Assign Permissions to Editor Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.role_name = 'Editor' AND p.permission_name IN ('create_product', 'read_product', 'update_product', 'upload_document');

-- Assign Permissions to Viewer Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.role_name = 'Viewer' AND p.permission_name = 'read_product';

-- Assign Permissions to Uploader Role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.role_name = 'Uploader' AND p.permission_name IN ('upload_document', 'read_product');