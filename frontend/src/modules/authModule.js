import { getFamsState, saveFamsState, getCurrentUser, setCurrentUser, logoutUser } from '../services/dataStore.js';
import { showToast, openModal, closeModal, getIndianDateTime } from '../services/uiUtils.js';

// Render Login Screen Overlay matching the modern clean reference design
export function renderLoginOverlay() {
  const currentUser = getCurrentUser();
  const loginContainer = document.getElementById('loginOverlay');
  if (!loginContainer) return;

  if (currentUser) {
    loginContainer.style.display = 'none';
    return;
  }

  loginContainer.style.display = 'flex';
  loginContainer.innerHTML = `
    <div class="login-upteam-wrapper">
      
      <!-- Split Card Container -->
      <div class="login-upteam-card">
        
        <!-- Left Column: Vibrant Cobalt Blue Hero Banner -->
        <div class="login-upteam-left">
          
          <!-- Brand Logo Header -->
          <div class="upteam-brand-header">
            <img src="/plystory-logo.png" alt="Plystory Logo" style="height:32px; filter:brightness(0) invert(1);" />
            <span class="upteam-brand-name">PLYSTORY</span>
          </div>

          <!-- Center Vector Asset Clipboard Art -->
          <div class="upteam-art-center">
            <div class="upteam-clipboard-art">
              <div class="upteam-clip-header"></div>
              <div class="upteam-clipboard-body">
                <div class="upteam-check-line"><span class="upteam-check">✓</span> <span class="upteam-dash"></span></div>
                <div class="upteam-check-line"><span class="upteam-cross">✕</span> <span class="upteam-dash long"></span></div>
                <div class="upteam-check-line"><span class="upteam-check">✓</span> <span class="upteam-dash"></span></div>
              </div>
              <div class="upteam-pencil-art"></div>
            </div>
          </div>

          <!-- Bottom Welcome Text & Carousel Dots -->
          <div class="upteam-welcome-footer">
            <h2 class="upteam-welcome-title">Welcome!</h2>
            <p class="upteam-welcome-sub">Statutory Fixed Asset Management System & Audit Portal.</p>
            
            <div class="upteam-dots-row">
              <span class="upteam-dot active"></span>
              <span class="upteam-dot"></span>
              <span class="upteam-dot"></span>
            </div>
          </div>

        </div>

        <!-- Right Column: Clean White Form Pane -->
        <div class="login-upteam-right">
          
          <div class="upteam-form-inner">
            <h1 class="upteam-login-title">Log In</h1>
            <p class="upteam-signup-prompt">
              Plystory FAMS &bull; <span style="color:#0066ff; font-weight:600;">Statutory Compliance</span>
            </p>

            <form id="formFamsLogin" class="upteam-form-body">
              
              <!-- Username / Email Input -->
              <div class="upteam-field-group">
                <div class="upteam-input-wrap">
                  <input 
                    type="text" 
                    id="loginUsername" 
                    class="upteam-line-input" 
                    value="ithelpdesk@plystory.com" 
                    placeholder="Username or Email"
                    required 
                  />
                  <i data-lucide="user" class="upteam-input-icon"></i>
                </div>
              </div>

              <!-- Password Input -->
              <div class="upteam-field-group" style="margin-top:28px;">
                <div class="upteam-input-wrap">
                  <input 
                    type="password" 
                    id="loginPassword" 
                    class="upteam-line-input" 
                    value="Kdeka@2602" 
                    placeholder="Password"
                    required 
                  />
                  <i data-lucide="lock" class="upteam-input-icon"></i>
                </div>
              </div>

              <!-- Sign In Button & Remember Password Checkbox Row -->
              <div class="upteam-action-row" style="margin-top:32px;">
                <button type="submit" class="upteam-signin-btn">
                  Sign in
                </button>

                <label class="upteam-remember-label">
                  <input type="checkbox" id="chkRememberPass" checked />
                  <span>Remember password</span>
                </label>
              </div>

              <!-- Forgot Password Link -->
              <div style="text-align:center; margin-top:28px;">
                <a href="javascript:void(0)" id="btnForgotPassPrompt" class="upteam-forgot-link">
                  Forget your password?
                </a>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ icons: window.lucide.icons });
  }

  // Forgot password handler
  const forgotBtn = document.getElementById('btnForgotPassPrompt');
  if (forgotBtn) {
    forgotBtn.onclick = () => {
      showToast('Default Administrator credentials: ithelpdesk@plystory.com / Kdeka@2602', 'info');
    };
  }

  const form = document.getElementById('formFamsLogin');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const state = getFamsState();

      const matchedUser = (state.users || []).find(u => 
        (u.email.toLowerCase() === username.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()) &&
        u.password === password
      );

      if (matchedUser) {
        if (matchedUser.status === 'Inactive') {
          showToast('Account is currently disabled. Contact System Administrator.', 'error');
          return;
        }

        setCurrentUser(matchedUser);
        loginContainer.style.display = 'none';
        showToast(`Welcome back, ${matchedUser.name}!`, 'success');
        
        // Log sign-in audit
        state.auditLogs.unshift({
          id: Date.now(),
          user: matchedUser.name,
          action: 'LOGIN',
          module: 'Authentication',
          details: `User signed in successfully (${matchedUser.email})`,
          time: getIndianDateTime(),
          ip: '10.20.1.45'
        });
        saveFamsState(state);

        if (window.navigateTo) window.navigateTo('dashboard');
        updateTopNavbarProfile();
      } else {
        showToast('Invalid username or password. Please check credentials.', 'error');
      }
    };
  }
}

// Update Top Navbar Profile Header with Current Logged-in User
export function updateTopNavbarProfile() {
  const user = getCurrentUser() || {
    name: 'IT Helpdesk Admin',
    email: 'ithelpdesk@plystory.com',
    role: 'Super Admin'
  };

  const nameEl = document.getElementById('topProfileName');
  const roleEl = document.getElementById('topProfileRole');
  const avatarEl = document.getElementById('topProfileAvatar');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role || 'Asset Manager';
  if (avatarEl) {
    avatarEl.textContent = (user.name || 'Admin').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  }
}

// Open View Profile Modal (Edit Name, Email, and Reset Password)
export function openUserProfileModal() {
  const user = getCurrentUser();
  if (!user) return;

  const state = getFamsState();
  const freshUser = (state.users || []).find(u => u.id === user.id) || user;

  const profileHtml = `
    <form id="formUserProfile">
      <div style="display:flex; align-items:center; gap:16px; background:#f8fafc; padding:16px; border-radius:8px; margin-bottom:18px; border:1px solid #eaedf1;">
        <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, #845adf, #23b7e5); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:800;">
          ${(freshUser.name || 'User').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style="font-size:1.05rem; font-weight:800; color:#1e293b;">${freshUser.name}</div>
          <div style="font-size:0.8rem; color:#8c9097;">${freshUser.email} &bull; <span class="badge badge-assigned">${freshUser.role}</span></div>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="profName" class="input-control" value="${freshUser.name}" required />
        </div>
        <div class="form-group">
          <label>Official Email Address *</label>
          <input type="email" id="profEmail" class="input-control" value="${freshUser.email}" required />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Plant / Facility Jurisdiction</label>
          <input type="text" class="input-control" value="${freshUser.plant || 'Corporate HQ'}" readonly style="background:#f1f5f9;" />
        </div>
        <div class="form-group">
          <label>Department</label>
          <input type="text" class="input-control" value="${freshUser.department || 'IT Infrastructure'}" readonly style="background:#f1f5f9;" />
        </div>
      </div>

      <hr style="border:0; border-top:1px solid #eaedf1; margin:16px 0;" />
      
      <h4 style="color:#845adf; font-size:0.9rem; font-weight:700; margin-bottom:12px;">Reset Security Password</h4>
      
      <div class="form-grid-2">
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="profNewPass" class="input-control" placeholder="Leave blank to keep unchanged" />
        </div>
        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" id="profConfirmPass" class="input-control" placeholder="Re-type new password" />
        </div>
      </div>

      <div class="modal-footer" style="padding-top:14px; margin-top:18px;">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Save Profile Changes</button>
      </div>
    </form>
  `;

  openModal('User Profile & Security Settings', 'Manage your credentials, email, and password', profileHtml, 'user');

  const form = document.getElementById('formUserProfile');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const newName = document.getElementById('profName').value.trim();
      const newEmail = document.getElementById('profEmail').value.trim();
      const newPass = document.getElementById('profNewPass').value.trim();
      const confirmPass = document.getElementById('profConfirmPass').value.trim();

      if (newPass && newPass !== confirmPass) {
        showToast('New passwords do not match!', 'error');
        return;
      }

      const dbUser = (state.users || []).find(u => u.id === freshUser.id);
      if (dbUser) {
        dbUser.name = newName;
        dbUser.email = newEmail;
        dbUser.username = newEmail;
        if (newPass) dbUser.password = newPass;

        setCurrentUser(dbUser);
        
        state.auditLogs.unshift({
          id: Date.now(),
          user: dbUser.name,
          action: 'UPDATE',
          module: 'Profile Settings',
          details: `Updated profile specifications and credentials for ${dbUser.email}`,
          time: getIndianDateTime(),
          ip: '10.20.1.45'
        });

        saveFamsState(state);
        closeModal();
        showToast('Profile updated successfully!', 'success');
        updateTopNavbarProfile();
        if (window.navigateTo) window.navigateTo('dashboard');
      }
    };
  }
}

// Admin: Open Create User Modal
export function openCreateUserModal() {
  const state = getFamsState();

  const createHtml = `
    <form id="formAdminCreateUser">
      <div class="form-grid-2">
        <div class="form-group">
          <label>User Full Name *</label>
          <input type="text" id="newUserName" class="input-control" placeholder="e.g., Rajesh Sharma" required />
        </div>
        <div class="form-group">
          <label>Official Email / Username *</label>
          <input type="email" id="newUserEmail" class="input-control" placeholder="name@plystory.com" required />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Password *</label>
          <input type="password" id="newUserPassword" class="input-control" placeholder="Temporary Login Password" required />
        </div>
        <div class="form-group">
          <label>System Role *</label>
          <select id="newUserRole" class="select-control" required>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Department</label>
          <select id="newUserDept" class="select-control">
            <option value="All Departments">All Departments</option>
            ${(state.departments || []).map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Plant / Location</label>
          <select id="newUserPlant" class="select-control">
            <option value="All Locations">All Locations</option>
            ${(state.locations || []).map(l => `<option value="${l.name}">${l.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="modal-footer" style="padding-top:14px; margin-top:18px;">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="user-plus"></i> Create User Account</button>
      </div>
    </form>
  `;

  openModal('Create New User Account', 'Provision enterprise credentials and plant access', createHtml, 'user-plus');

  const form = document.getElementById('formAdminCreateUser');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('newUserName').value.trim();
      const email = document.getElementById('newUserEmail').value.trim();
      const password = document.getElementById('newUserPassword').value.trim();
      const role = document.getElementById('newUserRole').value;
      const dept = document.getElementById('newUserDept').value;
      const plant = document.getElementById('newUserPlant').value;

      if ((state.users || []).some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('User with this email already exists!', 'error');
        return;
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        username: email,
        password,
        role,
        department: dept,
        plant,
        status: 'Active',
        created_at: getIndianDateTime()
      };

      state.users.push(newUser);
      state.auditLogs.unshift({
        id: Date.now(),
        user: getCurrentUser() ? getCurrentUser().name : 'Admin',
        action: 'CREATE',
        module: 'User Management',
        details: `Provisioned user account for ${name} (${email}) with role: ${role}`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      showToast(`User ${name} created successfully!`, 'success');
      if (window.navigateTo) window.navigateTo('admin-users');
    };
  }
}

// Admin: Open Edit User Modal
export function openEditUserModal(userId) {
  const state = getFamsState();
  const user = (state.users || []).find(u => u.id === userId);
  if (!user) return;

  const editHtml = `
    <form id="formAdminEditUser">
      <div class="form-grid-2">
        <div class="form-group">
          <label>User Full Name *</label>
          <input type="text" id="editUserName" class="input-control" value="${user.name}" required />
        </div>
        <div class="form-group">
          <label>Official Email *</label>
          <input type="email" id="editUserEmail" class="input-control" value="${user.email}" required />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Role</label>
          <select id="editUserRole" class="select-control" required>
            <option value="Admin" ${user.role === 'Admin' || user.role === 'Super Admin' ? 'selected' : ''}>Admin</option>
            <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="editUserStatus" class="select-control">
            <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Reset Password (Optional)</label>
        <input type="password" id="editUserPassword" class="input-control" placeholder="Enter new password to reset, or leave blank" />
      </div>

      <div class="modal-footer" style="padding-top:14px; margin-top:18px;">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary"><i data-lucide="check"></i> Update User</button>
      </div>
    </form>
  `;

  openModal(`Edit User: ${user.name}`, 'Modify credentials and permissions', editHtml, 'edit-3');

  const form = document.getElementById('formAdminEditUser');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      user.name = document.getElementById('editUserName').value.trim();
      user.email = document.getElementById('editUserEmail').value.trim();
      user.username = user.email;
      user.role = document.getElementById('editUserRole').value;
      user.status = document.getElementById('editUserStatus').value;
      
      const newPass = document.getElementById('editUserPassword').value.trim();
      if (newPass) user.password = newPass;

      state.auditLogs.unshift({
        id: Date.now(),
        user: getCurrentUser() ? getCurrentUser().name : 'Admin',
        action: 'UPDATE',
        module: 'User Management',
        details: `Updated user account credentials & role for ${user.name} (${user.email})`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      showToast(`User ${user.name} updated successfully!`, 'success');
      if (window.navigateTo) window.navigateTo('admin-users');
    };
  }
}

// Admin: Delete User
export function handleDeleteUser(userId) {
  const state = getFamsState();
  const user = (state.users || []).find(u => u.id === userId);
  if (!user) return;

  if (user.email === 'ithelpdesk@plystory.com') {
    showToast('Cannot delete the root administrator account!', 'error');
    return;
  }

  const deleteHtml = `
    <div style="font-size:0.9rem;">
      <p style="margin-bottom:14px; color:#334155;">
        Are you sure you want to permanently delete the user account for <strong>${user.name}</strong> (<code>${user.email}</code>)?
      </p>
      <div class="modal-footer" style="padding-top:14px;">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-rose" id="btnConfirmDeleteUser"><i data-lucide="trash-2"></i> Yes, Delete User</button>
      </div>
    </div>
  `;

  openModal(`Confirm Deletion: ${user.name}`, 'Delete User Account', deleteHtml, 'alert-triangle');

  const confirmBtn = document.getElementById('btnConfirmDeleteUser');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      state.users = (state.users || []).filter(u => u.id !== userId);
      state.auditLogs.unshift({
        id: Date.now(),
        user: getCurrentUser() ? getCurrentUser().name : 'Admin',
        action: 'DELETE',
        module: 'User Management',
        details: `Deleted user account ${user.name} (${user.email})`,
        time: getIndianDateTime(),
        ip: '10.20.1.45'
      });

      saveFamsState(state);
      closeModal();
      showToast(`User ${user.name} deleted successfully!`, 'info');
      if (window.navigateTo) window.navigateTo('admin-users');
    };
  }
}

// Attach User Management Event Listeners
export function attachAdminUserListeners() {
  const btnAdd = document.getElementById('btnAddNewUser');
  if (btnAdd) btnAdd.onclick = openCreateUserModal;

  document.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.getAttribute('data-id'));
      openEditUserModal(id);
    };
  });

  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.getAttribute('data-id'));
      handleDeleteUser(id);
    };
  });
}
