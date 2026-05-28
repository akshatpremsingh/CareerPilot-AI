// app.js
// Resume Generator - complete, consistent with index.html IDs
class ResumeGenerator {
    constructor() {
        this.resumeData = {
            personal: {},
            education: [],
            experience: [],
            skills: { technical: [], soft: [], languages: [] },
            projects: [],
            certifications: [],
            achievements: []
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.updatePreview();
    }

    bindEvents() {
        // Personal fields
        const personalFields = ['fullName','email','phone','address','linkedin','website','summary'];
        personalFields.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', () => {
                this.clearFieldError(el);
                this.updatePersonalInfo();
            });
        });

        // Dynamic add buttons
        const mapBtn = {
            addEducation: () => this.addEducationEntry(),
            addExperience: () => this.addExperienceEntry(),
            addProject: () => this.addProjectEntry(),
            addCertification: () => this.addCertificationEntry(),
            addAchievement: () => this.addAchievementEntry()
        };
        Object.entries(mapBtn).forEach(([id,fn]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        });

        // Skills buttons and enter key
        const skillBindings = [
            { btn: 'addTechnicalSkill', input: 'technicalSkillInput', type: 'technical' , level: 'technicalSkillLevel' },
            { btn: 'addSoftSkill', input: 'softSkillInput', type: 'soft' },
            { btn: 'addLanguage', input: 'languageInput', type: 'languages', level: 'languageLevel' }
        ];
        skillBindings.forEach(({btn, input, type}) => {
            const btnEl = document.getElementById(btn);
            const inputEl = document.getElementById(input);
            if (btnEl) btnEl.addEventListener('click', (e)=>{ e.preventDefault(); this.addSkill(type); });
            if (inputEl) inputEl.addEventListener('keypress', (e)=> {
                if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); this.addSkill(type); }
            });
        });

        // Form actions
        const clearBtn = document.getElementById('clearForm');
        if (clearBtn) clearBtn.addEventListener('click', ()=> this.clearForm());
        const genBtn = document.getElementById('generatePDF');
        if (genBtn) genBtn.addEventListener('click', ()=> this.handleGeneratePDF());
    }

    // ---------- Validation / UI helpers ----------
    validateRequiredFields() {
        const errors = [];
        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');

        if (!fullName || !fullName.value.trim()) { this.showFieldError(fullName, 'Full name is required'); errors.push('Full name'); }
        if (!email || !email.value.trim()) { this.showFieldError(email, 'Email is required'); errors.push('Email'); }
        else if (!this.isValidEmail(email.value.trim())) { this.showFieldError(email, 'Please enter a valid email'); errors.push('Valid email'); }
        if (!phone || !phone.value.trim()) { this.showFieldError(phone, 'Phone number is required'); errors.push('Phone number'); }

        return errors;
    }

    isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    showFieldError(field, message) {
        if (!field) return;
        field.classList.add('error');
        const existing = field.parentNode.querySelector('.error-message');
        if (existing) existing.remove();
        const span = document.createElement('span');
        span.className = 'error-message';
        span.textContent = message;
        field.parentNode.appendChild(span);
    }

    clearFieldError(field) {
        if (!field) return;
        field.classList.remove('error');
        const msg = field.parentNode.querySelector('.error-message');
        if (msg) msg.remove();
    }

    clearAllErrors() {
        document.querySelectorAll('.form-control.error').forEach(f => f.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(m => m.remove());
    }

    showNotification(message, type='info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        const n = document.createElement('div');
        n.className = `notification status--${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        // animate in/out
        setTimeout(()=> n.style.transform = 'translateX(0)', 10);
        setTimeout(()=> { n.style.transform = 'translateX(100%)'; setTimeout(()=> n.remove(), 300); }, 4500);
    }

    showLoadingOverlay() {
        const o = document.getElementById('loadingOverlay');
        if (o) o.classList.remove('hidden');
    }
    hideLoadingOverlay() {
        const o = document.getElementById('loadingOverlay');
        if (o) o.classList.add('hidden');
    }

    // ---------- PDF generation (light export only) ----------
    async handleGeneratePDF() {
        this.clearAllErrors();
        const errs = this.validateRequiredFields();
        if (errs.length) {
            this.showNotification('Please fill required fields before exporting', 'error');
            const first = document.querySelector('.form-control.error');
            if (first) first.scrollIntoView({behavior:'smooth', block:'center'});
            return;
        }
        await this.generatePDF();
    }

    async generatePDF() {
        this.showLoadingOverlay();
        try {
            const preview = document.getElementById('resumePreview');
            if (!preview) throw new Error('resumePreview element not found');

            // Save inline HTML of LinkedIn/Website so we can restore later
            const linkedinEl = document.getElementById('previewLinkedin');
            const websiteEl = document.getElementById('previewWebsite');
            const linkedinHTMLBackup = linkedinEl ? linkedinEl.innerHTML : null;
            const websiteHTMLBackup = websiteEl ? websiteEl.innerHTML : null;

            // Make links clickable if they contain text
            if (linkedinEl && linkedinEl.textContent && linkedinEl.textContent.trim()) {
                const val = linkedinEl.textContent.trim();
                const href = val.startsWith('http') ? val : `https://${val}`;
                linkedinEl.innerHTML = `<a href="${href}" target="_blank" rel="noopener">${val}</a>`;
            }
            if (websiteEl && websiteEl.textContent && websiteEl.textContent.trim()) {
                const val = websiteEl.textContent.trim();
                const href = val.startsWith('http') ? val : `https://${val}`;
                websiteEl.innerHTML = `<a href="${href}" target="_blank" rel="noopener">${val}</a>`;
            }

            // Force light export style class (CSS must include .light-export)
            preview.classList.add('light-export');

            // Temporarily expand preview so html2canvas captures full content
            const originalStyles = {
                maxHeight: preview.style.maxHeight || '',
                overflow: preview.style.overflow || '',
                height: preview.style.height || '',
                position: preview.style.position || ''
            };
            preview.style.maxHeight = 'none';
            preview.style.overflow = 'visible';
            preview.style.height = 'auto';
            preview.style.position = 'relative';

            // small layout settle
            await new Promise(r => setTimeout(r, 120));

            const fileName = (this.resumeData.personal.fullName && this.resumeData.personal.fullName.trim())
                ? `Resume_${this.resumeData.personal.fullName.trim().replace(/\s+/g,'_')}.pdf`
                : 'Resume.pdf';

            const options = {
                margin: 0.5,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all','css','legacy'] }
            };

            await html2pdf().set(options).from(preview).save();

            // restore styles
            Object.assign(preview.style, originalStyles);

            // restore link HTML
            if (linkedinEl && linkedinHTMLBackup !== null) linkedinEl.innerHTML = linkedinHTMLBackup;
            if (websiteEl && websiteHTMLBackup !== null) websiteEl.innerHTML = websiteHTMLBackup;

            preview.classList.remove('light-export');
            this.showNotification('PDF generated successfully', 'success');
        } catch (err) {
            console.error('generatePDF error:', err);
            this.showNotification('Error generating PDF. Check console.', 'error');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    // ---------- Personal / Preview updates ----------
    updatePersonalInfo() {
        const fields = ['fullName','email','phone','address','linkedin','website','summary'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) this.resumeData.personal[id] = el.value;
        });
        this.updatePreview();
    }

    updatePreview() {
        this.updatePersonalPreview();
        this.updateEducationPreview();
        this.updateExperiencePreview();
        this.updateSkillsPreview();
        this.updateProjectsPreview();
        this.updateCertificationsPreview();
        this.updateAchievementsPreview();
    }

    updatePersonalPreview() {
        const p = this.resumeData.personal;
        const safe = s => s && s.trim() ? s : '';
        const setText = (id, text, fallback='') => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = text || fallback;
        };

        setText('previewName', safe(p.fullName) || 'Your Name');
        setText('previewEmail', safe(p.email) || 'your.email@example.com');
        setText('previewPhone', safe(p.phone) || '+1 (555) 123-4567');
        setText('previewAddress', safe(p.address) || 'Your Address');

        const linkedinEl = document.getElementById('previewLinkedin');
        const websiteEl = document.getElementById('previewWebsite');
        if (linkedinEl) linkedinEl.textContent = safe(p.linkedin);
        if (websiteEl) websiteEl.textContent = safe(p.website);

        const summarySection = document.getElementById('resumeSummarySection');
        const summaryEl = document.getElementById('previewSummary');
        if (p.summary && p.summary.trim()) {
            if (summaryEl) summaryEl.textContent = p.summary;
            if (summarySection) summarySection.style.display = 'block';
        } else {
            if (summarySection) summarySection.style.display = 'none';
        }
    }

    formatDate(monthValue) {
        if (!monthValue) return '';
        // monthValue from input type=month is YYYY-MM
        try {
            const [y,m] = monthValue.split('-');
            const date = new Date(Number(y), Number(m)-1, 1);
            return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        } catch {
            return monthValue;
        }
    }

    // ---------- Education ----------
    addEducationEntry() {
        const index = this.resumeData.education.length;
        const entry = { institution:'', degree:'', field:'', startDate:'', endDate:'', gpa:'', description:'' };
        this.resumeData.education.push(entry);
        const container = document.getElementById('educationContainer');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', this.createEducationEntryHtml(index));
        this.bindEducationEvents(index);
        this.updatePreview();
    }

    createEducationEntryHtml(index) {
        return `
        <div class="dynamic-entry" data-index="${index}">
            <div class="entry-header">
                <span class="entry-title">Education Entry ${index+1}</span>
                <button type="button" class="remove-entry" onclick="resumeGen.removeEducationEntry(${index})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Institution</label>
                    <input type="text" class="form-control" id="edu_institution_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Degree</label>
                    <input type="text" class="form-control" id="edu_degree_${index}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Field of Study</label>
                    <input type="text" class="form-control" id="edu_field_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">GPA/Grade</label>
                    <input type="text" class="form-control" id="edu_gpa_${index}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="month" class="form-control" id="edu_startDate_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input type="month" class="form-control" id="edu_endDate_${index}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" id="edu_description_${index}"></textarea>
            </div>
        </div>`;
    }

    bindEducationEvents(index) {
        const fields = ['institution','degree','field','startDate','endDate','gpa','description'];
        fields.forEach(f => {
            const el = document.getElementById(`edu_${f}_${index}`);
            if (!el) return;
            el.addEventListener('input', () => {
                this.resumeData.education[index][f] = el.value;
                this.updatePreview();
            });
        });
    }

    removeEducationEntry(index) {
        if (index < 0 || index >= this.resumeData.education.length) return;
        this.resumeData.education.splice(index, 1);
        this.rebuildEducationSection();
        this.updatePreview();
    }

    rebuildEducationSection() {
        const container = document.getElementById('educationContainer');
        if (!container) return;
        container.innerHTML = '';
        this.resumeData.education.forEach((entry, idx) => {
            container.insertAdjacentHTML('beforeend', this.createEducationEntryHtml(idx));
            this.bindEducationEvents(idx);
            this.populateEducationEntry(idx);
        });
    }

    populateEducationEntry(index) {
        const entry = this.resumeData.education[index];
        if (!entry) return;
        ['institution','degree','field','startDate','endDate','gpa','description'].forEach(f => {
            const el = document.getElementById(`edu_${f}_${index}`);
            if (el && entry[f]) el.value = entry[f];
        });
    }

    updateEducationPreview() {
        const section = document.getElementById('resumeEducationSection');
        const container = document.getElementById('previewEducation');
        if (!section || !container) return;

        if (!this.resumeData.education.length || !this.resumeData.education.some(e => e.institution || e.degree)) {
            section.style.display = 'none'; return;
        }
        section.style.display = 'block';
        container.innerHTML = '';
        this.resumeData.education.forEach(edu => {
            if (!edu.institution && !edu.degree) return;
            const start = this.formatDate(edu.startDate);
            const end = edu.endDate ? this.formatDate(edu.endDate) : 'Present';
            const dateRange = start ? `${start}${end ? ` - ${end}` : ''}` : '';
            const div = document.createElement('div');
            div.className = 'education-entry';
            div.innerHTML = `
                <div class="entry-header-resume">
                    <div>
                        <div class="entry-title-resume">${edu.institution || ''}</div>
                        <div class="entry-subtitle">${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}${edu.gpa ? ` (${edu.gpa})` : ''}</div>
                    </div>
                    ${dateRange ? `<div class="entry-date">${dateRange}</div>` : ''}
                </div>
                ${edu.description ? `<div class="entry-description">${edu.description}</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    // ---------- Experience ----------
    addExperienceEntry() {
        const index = this.resumeData.experience.length;
        const entry = { company:'', position:'', employmentType:'', startDate:'', endDate:'', location:'', description:'' };
        this.resumeData.experience.push(entry);
        const container = document.getElementById('experienceContainer');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', this.createExperienceEntryHtml(index));
        this.bindExperienceEvents(index);
        this.updatePreview();
    }

    createExperienceEntryHtml(index) {
        return `
        <div class="dynamic-entry" data-index="${index}">
            <div class="entry-header">
                <span class="entry-title">Experience Entry ${index+1}</span>
                <button type="button" class="remove-entry" onclick="resumeGen.removeExperienceEntry(${index})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Company Name</label>
                    <input type="text" class="form-control" id="exp_company_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Job Title</label>
                    <input type="text" class="form-control" id="exp_position_${index}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Employment Type</label>
                    <select class="form-control" id="exp_employmentType_${index}">
                        <option value="">Select Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" id="exp_location_${index}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="month" class="form-control" id="exp_startDate_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input type="month" class="form-control" id="exp_endDate_${index}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Job Description</label>
                <textarea class="form-control" rows="4" id="exp_description_${index}" placeholder="• Describe your responsibilities and achievements"></textarea>
            </div>
        </div>`;
    }

    bindExperienceEvents(index) {
        const fields = ['company','position','employmentType','startDate','endDate','location','description'];
        fields.forEach(f => {
            const el = document.getElementById(`exp_${f}_${index}`);
            if (!el) return;
            el.addEventListener('input', () => {
                this.resumeData.experience[index][f] = el.value;
                this.updatePreview();
            });
        });
    }

    removeExperienceEntry(index) {
        if (index < 0 || index >= this.resumeData.experience.length) return;
        this.resumeData.experience.splice(index, 1);
        this.rebuildExperienceSection();
        this.updatePreview();
    }

    rebuildExperienceSection() {
        const container = document.getElementById('experienceContainer');
        if (!container) return;
        container.innerHTML = '';
        this.resumeData.experience.forEach((_, idx) => {
            container.insertAdjacentHTML('beforeend', this.createExperienceEntryHtml(idx));
            this.bindExperienceEvents(idx);
            this.populateExperienceEntry(idx);
        });
    }

    populateExperienceEntry(index) {
        const entry = this.resumeData.experience[index];
        if (!entry) return;
        ['company','position','employmentType','startDate','endDate','location','description'].forEach(f => {
            const el = document.getElementById(`exp_${f}_${index}`);
            if (el && entry[f]) el.value = entry[f];
        });
    }

    updateExperiencePreview() {
        const section = document.getElementById('resumeExperienceSection');
        const container = document.getElementById('previewExperience');
        if (!section || !container) return;

        if (!this.resumeData.experience.length || !this.resumeData.experience.some(e => e.company || e.position)) {
            section.style.display = 'none'; return;
        }
        section.style.display = 'block';
        container.innerHTML = '';
        this.resumeData.experience.forEach(exp => {
            if (!exp.company && !exp.position) return;
            const start = this.formatDate(exp.startDate);
            const end = exp.endDate ? this.formatDate(exp.endDate) : 'Present';
            const dateRange = start ? `${start}${end ? ` - ${end}` : ''}` : '';
            const div = document.createElement('div');
            div.className = 'experience-entry';
            div.innerHTML = `
                <div class="entry-header-resume">
                    <div>
                        <div class="entry-title-resume">${exp.position || ''}</div>
                        <div class="entry-subtitle">${exp.company || ''}${exp.employmentType ? ` (${exp.employmentType})` : ''}${exp.location ? ` - ${exp.location}` : ''}</div>
                    </div>
                    ${dateRange ? `<div class="entry-date">${dateRange}</div>` : ''}
                </div>
                ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    // ---------- Skills ----------
    addSkill(type) {
        const inputId = type === 'technical' ? 'technicalSkillInput' : type === 'soft' ? 'softSkillInput' : 'languageInput';
        const levelId = type === 'technical' ? 'technicalSkillLevel' : type === 'languages' ? 'languageLevel' : null;
        const input = document.getElementById(inputId);
        const level = levelId ? document.getElementById(levelId) : null;
        if (!input) return;
        const name = input.value.trim();
        if (!name) { this.showNotification('Please enter a skill name', 'error'); return; }
        const skill = { name, level: level ? level.value : '' };
        // dedupe
        const exists = this.resumeData.skills[type].some(s => s.name.toLowerCase() === name.toLowerCase());
        if (exists) { this.showNotification('This skill already exists', 'error'); input.value=''; return; }
        this.resumeData.skills[type].push(skill);
        input.value = '';
        if (level) level.selectedIndex = 0;
        this.updateSkillsList(type);
        this.updatePreview();
        this.showNotification(`Added ${name}`, 'success');
    }

    removeSkill(type, index) {
        if (!this.resumeData.skills[type] || index < 0 || index >= this.resumeData.skills[type].length) return;
        this.resumeData.skills[type].splice(index,1);
        this.updateSkillsList(type);
        this.updatePreview();
    }

    updateSkillsList(type) {
        const listId = type === 'technical' ? 'technicalSkillsList' : type === 'soft' ? 'softSkillsList' : 'languagesList';
        const list = document.getElementById(listId);
        if (!list) return;
        list.innerHTML = '';
        this.resumeData.skills[type].forEach((skill, idx) => {
            const div = document.createElement('div');
            div.className = 'skill-tag';
            div.innerHTML = `
                ${this.escapeHtml(skill.name)}
                ${skill.level ? `<span class="skill-level">${this.escapeHtml(skill.level)}</span>` : ''}
                <button type="button" class="remove-skill" onclick="resumeGen.removeSkill('${type}', ${idx})">×</button>
            `;
            list.appendChild(div);
        });
    }

    // ---------- Projects ----------
    addProjectEntry() {
        const index = this.resumeData.projects.length;
        const entry = { name:'', description:'', technologies:'', url:'' };
        this.resumeData.projects.push(entry);
        const container = document.getElementById('projectsContainer');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', this.createProjectEntryHtml(index));
        this.bindProjectEvents(index);
        this.updatePreview();
    }

    createProjectEntryHtml(index) {
        return `
        <div class="dynamic-entry" data-index="${index}">
            <div class="entry-header">
                <span class="entry-title">Project ${index+1}</span>
                <button type="button" class="remove-entry" onclick="resumeGen.removeProjectEntry(${index})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Project Name</label>
                    <input type="text" class="form-control" id="proj_name_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Project URL</label>
                    <input type="url" class="form-control" id="proj_url_${index}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Technologies Used</label>
                <input type="text" class="form-control" id="proj_technologies_${index}" placeholder="e.g., React, Node.js, MongoDB">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" id="proj_description_${index}"></textarea>
            </div>
        </div>`;
    }

    bindProjectEvents(index) {
        ['name','description','technologies','url'].forEach(f => {
            const el = document.getElementById(`proj_${f}_${index}`);
            if (!el) return;
            el.addEventListener('input', () => {
                this.resumeData.projects[index][f] = el.value;
                this.updatePreview();
            });
        });
    }

    removeProjectEntry(index) {
        if (index < 0 || index >= this.resumeData.projects.length) return;
        this.resumeData.projects.splice(index, 1);
        this.rebuildProjectsSection();
        this.updatePreview();
    }

    rebuildProjectsSection() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;
        container.innerHTML = '';
        this.resumeData.projects.forEach((_, idx) => {
            container.insertAdjacentHTML('beforeend', this.createProjectEntryHtml(idx));
            this.bindProjectEvents(idx);
            this.populateProjectEntry(idx);
        });
    }

    populateProjectEntry(index) {
        const entry = this.resumeData.projects[index];
        if (!entry) return;
        ['name','description','technologies','url'].forEach(f => {
            const el = document.getElementById(`proj_${f}_${index}`);
            if (el && entry[f]) el.value = entry[f];
        });
    }

    updateProjectsPreview() {
        const section = document.getElementById('resumeProjectsSection');
        const container = document.getElementById('previewProjects');
        if (!section || !container) return;
        if (!this.resumeData.projects.length || !this.resumeData.projects.some(p => p.name)) {
            section.style.display = 'none'; return;
        }
        section.style.display = 'block';
        container.innerHTML = '';
        this.resumeData.projects.forEach(p => {
            if (!p.name) return;
            const div = document.createElement('div');
            div.className = 'project-entry';
            div.innerHTML = `
                <div class="entry-title-resume">${p.name}${p.url ? ` (${p.url})` : ''}</div>
                ${p.technologies ? `<div class="entry-subtitle">Technologies: ${p.technologies}</div>` : ''}
                ${p.description ? `<div class="entry-description">${p.description}</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    // ---------- Certifications ----------
    addCertificationEntry() {
        const index = this.resumeData.certifications.length;
        const entry = { name:'', organization:'', date:'', credentialId:'' };
        this.resumeData.certifications.push(entry);
        const container = document.getElementById('certificationsContainer');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', this.createCertificationEntryHtml(index));
        this.bindCertificationEvents(index);
        this.updatePreview();
    }

    createCertificationEntryHtml(index) {
        return `
        <div class="dynamic-entry" data-index="${index}">
            <div class="entry-header">
                <span class="entry-title">Certification ${index+1}</span>
                <button type="button" class="remove-entry" onclick="resumeGen.removeCertificationEntry(${index})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Certification Name</label>
                    <input type="text" class="form-control" id="cert_name_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Issuing Organization</label>
                    <input type="text" class="form-control" id="cert_organization_${index}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Date Obtained</label>
                    <input type="month" class="form-control" id="cert_date_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Credential ID</label>
                    <input type="text" class="form-control" id="cert_credentialId_${index}">
                </div>
            </div>
        </div>`;
    }

    bindCertificationEvents(index) {
        ['name','organization','date','credentialId'].forEach(f => {
            const el = document.getElementById(`cert_${f}_${index}`);
            if (!el) return;
            el.addEventListener('input', () => {
                this.resumeData.certifications[index][f] = el.value;
                this.updatePreview();
            });
        });
    }

    removeCertificationEntry(index) {
        if (index < 0 || index >= this.resumeData.certifications.length) return;
        this.resumeData.certifications.splice(index,1);
        this.rebuildCertificationsSection();
        this.updatePreview();
    }

    rebuildCertificationsSection() {
        const container = document.getElementById('certificationsContainer');
        if (!container) return;
        container.innerHTML = '';
        this.resumeData.certifications.forEach((_, idx) => {
            container.insertAdjacentHTML('beforeend', this.createCertificationEntryHtml(idx));
            this.bindCertificationEvents(idx);
            this.populateCertificationEntry(idx);
        });
    }

    populateCertificationEntry(index) {
        const entry = this.resumeData.certifications[index];
        if (!entry) return;
        ['name','organization','date','credentialId'].forEach(f => {
            const el = document.getElementById(`cert_${f}_${index}`);
            if (el && entry[f]) el.value = entry[f];
        });
    }

    updateCertificationsPreview() {
        const section = document.getElementById('resumeCertificationsSection');
        const container = document.getElementById('previewCertifications');
        if (!section || !container) return;
        if (!this.resumeData.certifications.length || !this.resumeData.certifications.some(c => c.name)) {
            section.style.display = 'none'; return;
        }
        section.style.display = 'block';
        container.innerHTML = '';
        this.resumeData.certifications.forEach(cert => {
            if (!cert.name) return;
            const date = this.formatDate(cert.date);
            const div = document.createElement('div');
            div.className = 'certification-entry';
            div.innerHTML = `
                <div class="entry-header-resume">
                    <div>
                        <div class="entry-title-resume">${cert.name}</div>
                        <div class="entry-subtitle">${cert.organization || ''}${cert.credentialId ? ` (ID: ${cert.credentialId})` : ''}</div>
                    </div>
                    ${date ? `<div class="entry-date">${date}</div>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
    }

    // ---------- Achievements ----------
    addAchievementEntry() {
        const index = this.resumeData.achievements.length;
        const entry = { title:'', organization:'', date:'', description:'' };
        this.resumeData.achievements.push(entry);
        const container = document.getElementById('achievementsContainer');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', this.createAchievementEntryHtml(index));
        this.bindAchievementEvents(index);
        this.updatePreview();
    }

    createAchievementEntryHtml(index) {
        return `
        <div class="dynamic-entry" data-index="${index}">
            <div class="entry-header">
                <span class="entry-title">Achievement ${index+1}</span>
                <button type="button" class="remove-entry" onclick="resumeGen.removeAchievementEntry(${index})">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Award/Achievement Title</label>
                    <input type="text" class="form-control" id="ach_title_${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Organization</label>
                    <input type="text" class="form-control" id="ach_organization_${index}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Date</label>
                <input type="month" class="form-control" id="ach_date_${index}">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" id="ach_description_${index}"></textarea>
            </div>
        </div>`;
    }

    bindAchievementEvents(index) {
        ['title','organization','date','description'].forEach(f => {
            const el = document.getElementById(`ach_${f}_${index}`);
            if (!el) return;
            el.addEventListener('input', () => {
                this.resumeData.achievements[index][f] = el.value;
                this.updatePreview();
            });
        });
    }

    removeAchievementEntry(index) {
        if (index < 0 || index >= this.resumeData.achievements.length) return;
        this.resumeData.achievements.splice(index,1);
        this.rebuildAchievementsSection();
        this.updatePreview();
    }

    rebuildAchievementsSection() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;
        container.innerHTML = '';
        this.resumeData.achievements.forEach((_, idx) => {
            container.insertAdjacentHTML('beforeend', this.createAchievementEntryHtml(idx));
            this.bindAchievementEvents(idx);
            this.populateAchievementEntry(idx);
        });
    }

    populateAchievementEntry(index) {
        const entry = this.resumeData.achievements[index];
        if (!entry) return;
        ['title','organization','date','description'].forEach(f => {
            const el = document.getElementById(`ach_${f}_${index}`);
            if (el && entry[f]) el.value = entry[f];
        });
    }

    updateAchievementsPreview() {
        const section = document.getElementById('resumeAchievementsSection');
        const container = document.getElementById('previewAchievements');
        if (!section || !container) return;
        if (!this.resumeData.achievements.length || !this.resumeData.achievements.some(a => a.title)) {
            section.style.display = 'none'; return;
        }
        section.style.display = 'block';
        container.innerHTML = '';
        this.resumeData.achievements.forEach(a => {
            if (!a.title) return;
            const date = this.formatDate(a.date);
            const div = document.createElement('div');
            div.className = 'achievement-entry';
            div.innerHTML = `
                <div class="entry-header-resume">
                    <div>
                        <div class="entry-title-resume">${a.title}</div>
                        <div class="entry-subtitle">${a.organization || ''}</div>
                    </div>
                    ${date ? `<div class="entry-date">${date}</div>` : ''}
                </div>
                ${a.description ? `<div class="entry-description">${a.description}</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    updateSkillsPreview() {
        const section = document.getElementById('resumeSkillsSection');
        const container = document.getElementById('previewSkills');
        if (!section || !container) return;
        const has = this.resumeData.skills.technical.length || this.resumeData.skills.soft.length || this.resumeData.skills.languages.length;
        if (!has) { section.style.display='none'; return; }
        section.style.display = 'block';
        container.innerHTML = '<div class="skills-section"></div>';
        const skillsSection = container.querySelector('.skills-section');

        if (this.resumeData.skills.technical.length) {
            const techDiv = document.createElement('div');
            techDiv.className = 'skill-category';
            techDiv.innerHTML = `
                <h4>Technical Skills</h4>
                <div class="skill-list">
                    ${this.resumeData.skills.technical.map(s => `<span class="skill-item has-level" data-level="${this.escapeHtml(s.level||'')}">${this.escapeHtml(s.name)}</span>`).join('')}
                </div>
            `;
            skillsSection.appendChild(techDiv);
        }
        if (this.resumeData.skills.soft.length) {
            const softDiv = document.createElement('div');
            softDiv.className = 'skill-category';
            softDiv.innerHTML = `
                <h4>Soft Skills</h4>
                <div class="skill-list">
                    ${this.resumeData.skills.soft.map(s => `<span class="skill-item">${this.escapeHtml(s.name)}</span>`).join('')}
                </div>
            `;
            skillsSection.appendChild(softDiv);
        }
        if (this.resumeData.skills.languages.length) {
            const langDiv = document.createElement('div');
            langDiv.className = 'skill-category';
            langDiv.innerHTML = `
                <h4>Languages</h4>
                <div class="skill-list">
                    ${this.resumeData.skills.languages.map(s => `<span class="skill-item has-level" data-level="${this.escapeHtml(s.level||'')}">${this.escapeHtml(s.name)}</span>`).join('')}
                </div>
            `;
            skillsSection.appendChild(langDiv);
        }
    }

    // ---------- Clear form ----------
    clearForm() {
        if (!confirm('Are you sure you want to clear all form data? This action cannot be undone.')) return;
        this.clearAllErrors();
        this.resumeData = {
            personal: {}, education: [], experience: [], skills: { technical: [], soft: [], languages: [] },
            projects: [], certifications: [], achievements: []
        };
        const f = document.getElementById('resumeForm');
        if (f) f.reset();
        ['educationContainer','experienceContainer','projectsContainer','certificationsContainer','achievementsContainer','technicalSkillsList','softSkillsList','languagesList'].forEach(id=>{
            const el = document.getElementById(id); if (el) el.innerHTML = '';
        });
        this.updatePreview();
        this.showNotification('Form cleared', 'info');
    }

    // ---------- Utilities ----------
    escapeHtml(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
}

// expose global variable used by inline onclicks in templates
let resumeGen;
document.addEventListener('DOMContentLoaded', () => {
    resumeGen = new ResumeGenerator();
    window.resumeGen = resumeGen;
});
