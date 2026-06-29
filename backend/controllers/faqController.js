const { mockStore } = require('../lib/mockStore');
const { isSupabaseConfigured, supabase } = require('../lib/supabaseClient');

// Get FAQs for a business
exports.getFAQsByBusiness = async (req, res) => {
  const { businessId } = req.params;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('business_id', businessId);
      
      if (error) {
        console.error(`❌ Supabase error loading FAQs for business ${businessId}:`, error.message);
        throw error;
      }
      return res.json(data || []);
    } catch (err) {
      return res.status(500).json({ error: `Supabase load FAQs failed: ${err.message}` });
    }
  }

  // Mock Store filter
  const faqs = mockStore.faqs.filter(f => f.business_id === businessId);
  res.json(faqs);
};

// Create an FAQ
exports.createFAQ = async (req, res) => {
  const { business_id, question, answer } = req.body;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert([{ business_id, question, answer }])
        .select();

      if (error) {
        console.error('❌ Supabase error inserting FAQ:', error.message);
        throw error;
      }
      return res.status(201).json(data[0]);
    } catch (err) {
      return res.status(500).json({ error: `Supabase create FAQ failed: ${err.message}` });
    }
  }

  // Mock Store insertion
  const newFaq = {
    id: `f-${Date.now()}`,
    business_id,
    question,
    answer
  };
  mockStore.faqs.push(newFaq);
  res.status(201).json(newFaq);
};

// Update an FAQ
exports.updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .update({ question, answer })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`❌ Supabase error updating FAQ ${id}:`, error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return res.json(data[0]);
      } else {
        return res.status(404).json({ error: 'FAQ not found to update' });
      }
    } catch (err) {
      return res.status(500).json({ error: `Supabase update FAQ failed: ${err.message}` });
    }
  }

  // Mock Store update
  const index = mockStore.faqs.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'FAQ not found' });
  }

  const updated = {
    ...mockStore.faqs[index],
    question: question !== undefined ? question : mockStore.faqs[index].question,
    answer: answer !== undefined ? answer : mockStore.faqs[index].answer,
  };

  mockStore.faqs[index] = updated;
  res.json(updated);
};

// Delete an FAQ
exports.deleteFAQ = async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`❌ Supabase error deleting FAQ ${id}:`, error.message);
        throw error;
      }
      return res.json({ success: true, message: 'FAQ deleted successfully' });
    } catch (err) {
      return res.status(500).json({ error: `Supabase delete FAQ failed: ${err.message}` });
    }
  }

  // Mock Store delete
  const index = mockStore.faqs.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'FAQ not found' });
  }

  mockStore.faqs.splice(index, 1);
  res.json({ success: true, message: 'FAQ deleted successfully' });
};
