import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

const normalizeSlug = (value) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  slug: '',
  category: '',
  city: '',
  postcode: '',
  service_area: '',
  opening_hours: '',
  description: '',
  public_description: '',
  is_public: false,
  logo_url: ''
};

const hydrateForm = (business = {}) => ({
  name: business.name || '',
  phone: business.phone || '',
  email: business.email || '',
  slug: business.slug || '',
  category: business.category || '',
  city: business.city || '',
  postcode: business.postcode || '',
  service_area: business.service_area || '',
  opening_hours: business.opening_hours || '',
  description: business.description || '',
  public_description: business.public_description || '',
  is_public: Boolean(business.is_public),
  logo_url: business.logo_url || ''
});

const getPublishIssues = (values) => {
  const issues = [];
  if (!values.name.trim()) issues.push('Public business name is required.');
  if (!normalizeSlug(values.slug)) issues.push('Slug is required.');
  if (!values.category.trim()) issues.push('Category is required.');
  if (!values.city.trim() && !values.service_area.trim()) {
    issues.push('City or service area is required.');
  }
  if (!values.public_description.trim()) issues.push('Public description is required.');
  return issues;
};

const BusinessSetup = () => {
  const [businessId, setBusinessId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const previewSlug = normalizeSlug(form.slug);
  const publishIssues = useMemo(() => getPublishIssues(form), [form]);
  const profilePath = previewSlug ? `/business/${previewSlug}` : '';
  const statusLabel = form.is_public ? 'Published' : 'Draft';

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const data = await api.getBusinessOfCurrentUser();
        setBusinessId(data.id || '');
        setForm(hydrateForm(data));
      } catch (err) {
        console.error(err);
        setForm(emptyForm);
      } finally {
        setIsLoading(false);
      }
    };
    loadBusiness();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Business name is required.';

    if (form.is_public) {
      if (!previewSlug) nextErrors.slug = 'Slug is required before publishing.';
      if (!form.category.trim()) nextErrors.category = 'Category is required before publishing.';
      if (!form.city.trim() && !form.service_area.trim()) {
        nextErrors.city = 'Add a city or service area before publishing.';
        nextErrors.service_area = 'Add a city or service area before publishing.';
      }
      if (!form.public_description.trim()) {
        nextErrors.public_description = 'Public description is required before publishing.';
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    if (!validate()) {
      setMessage('Please resolve the highlighted fields before saving.');
      setMessageType('error');
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      slug: previewSlug || null,
      category: form.category.trim(),
      city: form.city.trim(),
      postcode: form.postcode.trim(),
      service_area: form.service_area.trim(),
      opening_hours: form.opening_hours.trim(),
      description: form.description.trim(),
      public_description: form.public_description.trim(),
      is_public: form.is_public,
      logo_url: form.logo_url.trim()
    };

    setIsSaving(true);
    try {
      const saved = businessId
        ? await api.updateBusiness(businessId, payload)
        : await api.createBusiness(payload);

      setBusinessId(saved.id || businessId);
      setForm(hydrateForm(saved));
      setMessage(saved.is_public ? 'Marketplace listing saved and published.' : 'Business profile saved as draft.');
      setMessageType('success');
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Failed to save business profile.');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-content loading">Loading business profile...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-welcome">Settings</span>
            <h1 className="dashboard-title">Business Profile Setup</h1>
          </div>
          <span className={`listing-status-pill ${form.is_public ? 'published' : 'draft'}`}>
            {statusLabel}
          </span>
        </header>

        {message && <div className={`form-message-alert ${messageType}`}>{message}</div>}

        <form className="business-setup-form" onSubmit={handleSave}>
          <section className="card-container business-profile-card">
            <div className="card-header">
              <h3>Business contact profile</h3>
              <p>These details support owner operations, customer follow-up, and the embedded receptionist.</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Contact phone</label>
                <input
                  id="phone"
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="e.g. +44 20 7946 0958"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Contact email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="e.g. hello@northside.example"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Internal business notes</label>
              <textarea
                id="description"
                className="form-input text-area"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Add operational notes, specialties, or standard procedures for the owner workspace."
              />
            </div>
          </section>

          <section className="card-container business-profile-card">
            <div className="card-header marketplace-listing-header-dashboard">
              <div>
                <h3>Marketplace storefront</h3>
                <p style={{ fontWeight: '500', color: 'var(--color-primary)', margin: '0.2rem 0 0.5rem 0' }}>
                  Your business profile is the storefront. Your services are the gigs customers book.
                </p>
                <p>Control how this business appears on CleanDesk public marketplace pages.</p>
              </div>
              <label className="publish-toggle">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(event) => updateField('is_public', event.target.checked)}
                />
                <span className="publish-toggle-track">
                  <span />
                </span>
                <strong>{form.is_public ? 'Published' : 'Draft'}</strong>
              </label>
            </div>

            {publishIssues.length > 0 && (
              <div className="listing-warning">
                <strong>Required before publishing</strong>
                <ul>
                  {publishIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="name">Public business name *</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="e.g. Northside Service Co"
                required
              />
              {fieldErrors.name && <p className="form-field-error">{fieldErrors.name}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="slug">Slug *</label>
                <div className="slug-input-row">
                  <input
                    id="slug"
                    type="text"
                    className="form-input"
                    value={form.slug}
                    onChange={(event) => updateField('slug', normalizeSlug(event.target.value))}
                    placeholder="northside-service-co"
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => updateField('slug', normalizeSlug(form.name))}
                  >
                    Generate
                  </button>
                </div>
                <p className="form-help-text">Lowercase letters, numbers, and hyphens only.</p>
                {fieldErrors.slug && <p className="form-field-error">{fieldErrors.slug}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <input
                  id="category"
                  type="text"
                  className="form-input"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="e.g. Home repairs"
                />
                {fieldErrors.category && <p className="form-field-error">{fieldErrors.category}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  className="form-input"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="e.g. London"
                />
                {fieldErrors.city && <p className="form-field-error">{fieldErrors.city}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postcode">Postcode</label>
                <input
                  id="postcode"
                  type="text"
                  className="form-input"
                  value={form.postcode}
                  onChange={(event) => updateField('postcode', event.target.value)}
                  placeholder="e.g. N1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="service_area">Service area *</label>
                <input
                  id="service_area"
                  type="text"
                  className="form-input"
                  value={form.service_area}
                  onChange={(event) => updateField('service_area', event.target.value)}
                  placeholder="e.g. Greater London, Zones 1-4"
                />
                {fieldErrors.service_area && <p className="form-field-error">{fieldErrors.service_area}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="opening_hours">Opening hours</label>
                <input
                  id="opening_hours"
                  type="text"
                  className="form-input"
                  value={form.opening_hours}
                  onChange={(event) => updateField('opening_hours', event.target.value)}
                  placeholder="e.g. Mon-Fri: 8AM-6PM, Sat: 9AM-4PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="public_description">Public description *</label>
              <textarea
                id="public_description"
                className="form-input text-area"
                value={form.public_description}
                onChange={(event) => updateField('public_description', event.target.value)}
                placeholder="Describe the public offer, service standards, and coverage customers should know."
              />
              {fieldErrors.public_description && <p className="form-field-error">{fieldErrors.public_description}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="logo_url">Logo URL</label>
              <input
                id="logo_url"
                type="url"
                className="form-input"
                value={form.logo_url}
                onChange={(event) => updateField('logo_url', event.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="listing-preview-box">
              <div>
                <span>Public profile URL</span>
                {profilePath ? (
                  <Link to={profilePath}>{profilePath}</Link>
                ) : (
                  <strong>Add a slug to create a profile URL</strong>
                )}
              </div>
              <p>
                {form.is_public && profilePath
                  ? 'This listing can appear in browse results and public profile pages after saving.'
                  : 'Save as draft to keep it out of the public marketplace.'}
              </p>
            </div>
          </section>

          <div className="business-form-actions">
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save business profile'}
            </button>
          </div>
        </form>

        {businessId && (
          <div className="card-container business-profile-card" style={{ marginTop: '2rem' }}>
            <div className="card-header">
              <h3>Embed chat widget</h3>
              <p>Copy this script tag to a website before the closing &lt;/body&gt; tag to deploy the receptionist widget.</p>
            </div>
            <div className="embed-code-box">
              <pre>
{`<script
  src="${window.location.origin.replace('5173', '5000')}/widget.js"
  data-business-id="${businessId}"
  async>
</script>`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessSetup;
