
-- Add quotedMessageId column to messages table
ALTER TABLE messages 
ADD COLUMN quoted_message_id TEXT REFERENCES messages(id);

-- Create index for better performance
CREATE INDEX idx_messages_quoted_message_id ON messages(quoted_message_id);
