create table chat (
	id uuid primary key,
	llm varchar not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table chat_message (
    id uuid primary key,
	chat_id uuid not null,
	message varchar not null,
	role varchar not null, -- user / model
	is_liked boolean not null default false, -- valid only of role is model
	is_disliked boolean not null default false, -- valid only of role is model
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	
	FOREIGN KEY (chat_id) REFERENCES chat(id)
);