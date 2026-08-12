const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login for: recluzedev@gmail.com');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'recluzedev@gmail.com',
    password: '123456',
  });

  if (error) {
    console.error('Login Failed:', error.message);
    process.exit(1);
  }

  console.log('Login Successful!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);
  console.log('Session exists:', !!data.session);
}

testLogin();
