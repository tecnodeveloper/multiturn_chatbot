SELECT id, chat_id, role, content, response_time, session_phase, created_at 
FROM public.messages 
ORDER BY created_at DESC;
