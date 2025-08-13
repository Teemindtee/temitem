--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_settings OWNER TO neondb_owner;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blog_posts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    author_id character varying NOT NULL,
    is_published boolean DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blog_posts OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contracts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    request_id character varying NOT NULL,
    proposal_id character varying NOT NULL,
    client_id character varying NOT NULL,
    finder_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    escrow_status text DEFAULT 'held'::text,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


ALTER TABLE public.contracts OWNER TO neondb_owner;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying NOT NULL,
    finder_id character varying NOT NULL,
    proposal_id character varying NOT NULL,
    last_message_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: finders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.finders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    jobs_completed integer DEFAULT 0,
    total_earned numeric(10,2) DEFAULT 0.00,
    average_rating numeric(3,2) DEFAULT 0.00,
    level text DEFAULT 'Novice'::text,
    bio text,
    phone text,
    available_balance numeric(10,2) DEFAULT 0.00,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.finders OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    conversation_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: proposals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.proposals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    request_id character varying NOT NULL,
    finder_id character varying NOT NULL,
    approach text NOT NULL,
    price text NOT NULL,
    timeline text NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.proposals OWNER TO neondb_owner;

--
-- Name: requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    client_id character varying NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    budget_min text,
    budget_max text,
    timeframe text,
    status text DEFAULT 'open'::text,
    token_cost integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.requests OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    contract_id character varying NOT NULL,
    client_id character varying NOT NULL,
    finder_id character varying NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    finder_id character varying NOT NULL,
    balance integer DEFAULT 0
);


ALTER TABLE public.tokens OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    finder_id character varying NOT NULL,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL,
    is_verified boolean DEFAULT false,
    is_banned boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    phone text,
    banned_reason text,
    banned_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.withdrawal_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    finder_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text,
    payment_method text NOT NULL,
    payment_details text NOT NULL,
    admin_notes text,
    processed_by character varying,
    requested_at timestamp without time zone DEFAULT now(),
    processed_at timestamp without time zone
);


ALTER TABLE public.withdrawal_requests OWNER TO neondb_owner;

--
-- Data for Name: admin_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_settings (id, key, value, updated_at) FROM stdin;
5956483e-54fa-499a-aef3-869aaebc5d86	proposal_token_cost	2	2025-08-13 18:31:51.514851
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blog_posts (id, title, slug, content, excerpt, author_id, is_published, published_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, description, is_active, created_at) FROM stdin;
2909df3b-6c7c-4c14-af5a-6f8ee32d9071	Web Development	Website and web application development	t	2025-08-13 18:26:50.111757
cat-tech	Technology	Software tools, apps, tech gadgets, and digital solutions	t	2025-08-13 21:37:03.139108
cat-business	Business Services	Professional services, consultants, business tools, and corporate solutions	t	2025-08-13 21:37:03.139108
cat-retail	Retail & Products	Physical products, suppliers, manufacturers, and retail connections	t	2025-08-13 21:37:03.139108
cat-local	Local Services	Local businesses, service providers, and community connections	t	2025-08-13 21:37:03.139108
cat-creative	Creative Services	Design, marketing, content creation, and creative professionals	t	2025-08-13 21:37:03.139108
cat-health	Health & Wellness	Healthcare providers, wellness services, and medical solutions	t	2025-08-13 21:37:03.139108
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contracts (id, request_id, proposal_id, client_id, finder_id, amount, escrow_status, is_completed, created_at, completed_at) FROM stdin;
7525c9a9-3ae5-4e0d-87c0-756a3eee2922	259a2886-583c-40b7-9266-e60fdafe66da	e4e7fdb4-9716-4f63-be76-ff2a20b5dd8a	2aa4873a-8040-42fb-b2eb-1841554f89bd	1cdc2486-666b-41dd-bac1-eb0034977492	1200.00	held	f	2025-08-13 17:07:25.874316	\N
d5182236-348d-4dac-bbcf-22ccebf5f1ce	259a2886-583c-40b7-9266-e60fdafe66da	895ce98b-fe38-4cc8-9da4-e565bd637f37	2aa4873a-8040-42fb-b2eb-1841554f89bd	c88125ca-379a-4109-bfdb-86cb4f646d48	950.00	held	f	2025-08-13 17:07:40.398269	\N
f08eeea7-0398-4153-974f-0684b1ba375b	4d43bdfa-150f-4254-88c0-eb4abd83f418	19b290d5-df47-458d-bb89-9c243cdd7665	2aa4873a-8040-42fb-b2eb-1841554f89bd	a8c15eec-08b9-4e93-b911-46af8887471b	650.00	held	f	2025-08-13 17:07:50.886743	\N
a6e85b44-8b67-4b3a-add6-522b25ad14e7	e7ace354-637a-4fb2-8ddc-bf24ce3d1a76	0d66c391-7a74-4152-9e65-d3b58128c1e3	2aa4873a-8040-42fb-b2eb-1841554f89bd	c88125ca-379a-4109-bfdb-86cb4f646d48	22.00	held	f	2025-08-13 17:24:03.759224	\N
contract-001	req-002	prop-003	33333333-3333-3333-3333-333333333333	f1111111-1111-1111-1111-111111111111	50.00	released	t	2025-08-08 21:37:49.714792	\N
contract-002	req-003	prop-004	77777777-7777-7777-7777-777777777777	f7777777-7777-7777-7777-777777777777	500.00	in_progress	f	2025-08-11 21:37:49.714792	\N
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversations (id, client_id, finder_id, proposal_id, last_message_at, created_at) FROM stdin;
6f9387c1-0d10-4c75-afcb-ab80c6ade4f4	2aa4873a-8040-42fb-b2eb-1841554f89bd	1cdc2486-666b-41dd-bac1-eb0034977492	e4e7fdb4-9716-4f63-be76-ff2a20b5dd8a	2025-08-13 17:56:03.802	2025-08-13 17:16:26.335083
conv-001	11111111-1111-1111-1111-111111111111	f2222222-2222-2222-2222-222222222222	prop-001	2025-08-13 17:38:00.105781	2025-08-12 21:38:00.105781
conv-002	33333333-3333-3333-3333-333333333333	f1111111-1111-1111-1111-111111111111	prop-003	2025-08-13 19:38:00.105781	2025-08-13 09:38:00.105781
conv-003	77777777-7777-7777-7777-777777777777	f7777777-7777-7777-7777-777777777777	prop-004	2025-08-13 20:38:00.105781	2025-08-11 21:38:00.105781
\.


--
-- Data for Name: finders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.finders (id, user_id, jobs_completed, total_earned, average_rating, level, bio, phone, available_balance, is_verified, created_at) FROM stdin;
a174fbbf-9c34-4788-8df7-38682459a2a9	78763947-ef7a-400c-a185-aba5864e962a	0	0.00	0.00	Novice	\N	\N	0.00	f	2025-08-13 18:21:39.338939
a8c15eec-08b9-4e93-b911-46af8887471b	9e32aaf4-c007-4f89-84fb-7c2cccbf3f80	0	0.00	0.00	Novice	\N	\N	0.00	f	2025-08-13 18:21:39.338939
f2222222-2222-2222-2222-222222222222	22222222-2222-2222-2222-222222222222	15	2850.00	4.80	Professional	Experienced product researcher specializing in electronics and home goods. I have connections with major suppliers.	\N	420.50	f	2025-08-13 21:36:57.389483
f4444444-4444-4444-4444-444444444444	44444444-4444-4444-4444-444444444444	8	1200.00	4.50	Professional	Tech-savvy finder with expertise in software tools and digital solutions.	\N	180.00	f	2025-08-13 21:36:57.389483
f6666666-6666-6666-6666-666666666666	66666666-6666-6666-6666-666666666666	3	450.00	3.80	Novice	New to the platform! Specializing in local services in the Chicago area.	\N	75.00	f	2025-08-13 21:36:57.389483
1cdc2486-666b-41dd-bac1-eb0034977492	d9da0f88-c3e8-488f-bc4e-5c68f6a2ca01	0	0.00	0.00	Novice	Updated finder bio - experienced full-stack developer	+1234567890	0.00	f	2025-08-13 18:21:39.338939
f1111111-1111-1111-1111-111111111111	d9da0f88-c3e8-488f-bc4e-5c68f6a2ca01	25	4500.00	4.90	Expert	Updated bio - Full-stack developer and problem solver	\N	850.00	f	2025-08-13 21:36:57.389483
c88125ca-379a-4109-bfdb-86cb4f646d48	f27f2cf2-5c76-4673-8fd3-50cd34ce2a71	0	0.00	0.00	Novice	Experienced finder ready to help clients find anything they need me jo	555-0123	0.00	f	2025-08-13 18:21:39.338939
f7777777-7777-7777-7777-777777777777	f27f2cf2-5c76-4673-8fd3-50cd34ce2a71	5	750.00	4.20	Novice	Enthusiastic new finder specializing in tech gadgets and software solutions for you 	\N	125.00	f	2025-08-13 21:36:57.389483
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, created_at) FROM stdin;
62e1b232-ec77-411e-8625-074411ccb6fd	6f9387c1-0d10-4c75-afcb-ab80c6ade4f4	2aa4873a-8040-42fb-b2eb-1841554f89bd	Test message from curl	f	2025-08-13 17:46:19.611533
2c5135ee-fbe8-4227-956c-c9b3a50d002b	6f9387c1-0d10-4c75-afcb-ab80c6ade4f4	2aa4873a-8040-42fb-b2eb-1841554f89bd	Testing message fix!	f	2025-08-13 17:48:03.059274
479fb2f6-7a4c-452c-b5d2-8bbdc0269898	6f9387c1-0d10-4c75-afcb-ab80c6ade4f4	2aa4873a-8040-42fb-b2eb-1841554f89bd	Enter key test message	f	2025-08-13 17:53:40.649071
eed47cd3-f668-4779-af6d-c103791b97eb	6f9387c1-0d10-4c75-afcb-ab80c6ade4f4	2aa4873a-8040-42fb-b2eb-1841554f89bd	Simple test after fix	f	2025-08-13 17:56:03.771962
msg-001	conv-001	11111111-1111-1111-1111-111111111111	Hi Mike! I saw your proposal for the CRM software. Can you tell me more about the HubSpot setup process?	f	2025-08-13 15:38:10.18281
msg-002	conv-001	22222222-2222-2222-2222-222222222222	Hi Sarah! I would be happy to walk you through the HubSpot setup. It typically takes 3-4 days for full implementation including data migration and team training.	f	2025-08-13 17:38:10.18281
msg-003	conv-002	33333333-3333-3333-3333-333333333333	Thank you for finding the rice suppliers! The quality samples look excellent. Can we proceed with the first supplier?	f	2025-08-13 18:38:10.18281
msg-004	conv-002	d9da0f88-c3e8-488f-bc4e-5c68f6a2ca01	Absolutely! I will arrange the contract and delivery schedule. They offer a 10% discount for orders over 1000kg. Shall I negotiate that for you?	f	2025-08-13 19:38:10.18281
msg-005	conv-003	77777777-7777-7777-7777-777777777777	Your social media portfolio is impressive! When can we start the Instagram strategy?	f	2025-08-13 19:38:10.18281
msg-006	conv-003	f27f2cf2-5c76-4673-8fd3-50cd34ce2a71	Thank you! I can start immediately. I will send you the content calendar and strategy document by tomorrow morning.	f	2025-08-13 20:38:10.18281
\.


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.proposals (id, request_id, finder_id, approach, price, timeline, notes, status, created_at) FROM stdin;
87951fff-e356-4803-b3b3-7955ef0db6e4	4ae22984-fcf2-469d-be20-6f685cee46e9	a174fbbf-9c34-4788-8df7-38682459a2a9	I am a React Native expert with 8+ years of experience. I will build a cross-platform food delivery app with real-time tracking, payment integration, and admin panel.	3800	6 weeks	Includes source code, documentation, and deployment assistance.	pending	2025-08-13 16:57:24.294576
e4e7fdb4-9716-4f63-be76-ff2a20b5dd8a	259a2886-583c-40b7-9266-e60fdafe66da	1cdc2486-666b-41dd-bac1-eb0034977492	I will create a modern, mobile-responsive e-commerce website using the latest design trends. I have 5+ years of experience in e-commerce design and will provide you with wireframes, mockups, and the final design files.	1200	3 weeks	I can also provide ongoing support for 30 days after delivery.	accepted	2025-08-13 16:57:24.294576
895ce98b-fe38-4cc8-9da4-e565bd637f37	259a2886-583c-40b7-9266-e60fdafe66da	c88125ca-379a-4109-bfdb-86cb4f646d48	I specialize in e-commerce website design and have worked with over 50 online stores. My approach includes user research, competitor analysis, and conversion-optimized design.	950	2.5 weeks	Portfolio available upon request. I offer 2 rounds of revisions.	accepted	2025-08-13 16:57:24.294576
19b290d5-df47-458d-bb89-9c243cdd7665	4d43bdfa-150f-4254-88c0-eb4abd83f418	a8c15eec-08b9-4e93-b911-46af8887471b	I am a professional graphic designer specializing in startup branding. I will create a unique logo, brand guidelines, business cards, and letterhead design.	650	1 week	Unlimited revisions until you are 100% satisfied.	accepted	2025-08-13 16:57:24.294576
0d66c391-7a74-4152-9e65-d3b58128c1e3	e7ace354-637a-4fb2-8ddc-bf24ce3d1a76	c88125ca-379a-4109-bfdb-86cb4f646d48	I know you	22	44	dddd	accepted	2025-08-13 17:22:07.665107
prop-001	req-001	f2222222-2222-2222-2222-222222222222	I recommend HubSpot CRM for your needs. It has excellent contact management, email integration, and reporting. I can help you set it up and train your team.	$150	1 week	I have experience setting up HubSpot for 20+ small businesses. Includes training and customization.	pending	2025-08-12 21:37:41.973886
prop-002	req-001	f4444444-4444-4444-4444-444444444444	For your requirements, I suggest Pipedrive or Zoho CRM. Both are cost-effective and user-friendly. I can provide demo and implementation support.	$200	10 days	Includes full setup, data migration, and 2-week support period.	pending	2025-08-13 03:37:41.973886
prop-003	req-002	f1111111-1111-1111-1111-111111111111	I have direct connections with 3 premium rice suppliers in Lagos. All are certified and can handle large volume orders. I can arrange visits and negotiate pricing.	$50	3 days	I will provide detailed supplier profiles, pricing comparison, and quality certifications.	accepted	2025-08-13 09:37:41.973886
prop-004	req-003	f7777777-7777-7777-7777-777777777777	I specialize in beauty brand social media marketing. I can create content strategy, manage posting schedule, and run targeted ad campaigns for Instagram and TikTok.	$500	2 weeks	Portfolio includes 15+ beauty brands with 200%+ engagement growth. Includes content calendar and analytics reports.	accepted	2025-08-11 21:37:41.973886
prop-005	req-004	f4444444-4444-4444-4444-444444444444	I can develop your fitness app for both iOS and Android using React Native. I have experience with Apple HealthKit and Google Fit integration.	$4500	6 weeks	Portfolio includes 3 health apps with 50K+ downloads. Includes UI/UX design, development, and app store submission.	pending	2025-08-13 18:37:41.973886
prop-006	req-006	f6666666-6666-6666-6666-666666666666	I can connect you with top team building facilitators in Chicago area. I work with several corporate event specialists who focus on leadership development.	$1200	2 weeks	I will provide 3 qualified facilitator options with portfolios and client testimonials.	pending	2025-08-13 17:37:41.973886
af758b50-0239-4749-a135-dc196698d0e4	c9547ce8-7950-489f-9f93-25aa3c5be082	c88125ca-379a-4109-bfdb-86cb4f646d48	Jjdjdjd djkdjdd 	150	2 weeks	Thanks	pending	2025-08-13 21:48:57.622873
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.requests (id, client_id, title, description, category, budget_min, budget_max, timeframe, status, token_cost, created_at) FROM stdin;
4ae22984-fcf2-469d-be20-6f685cee46e9	a26fb44a-1534-4fe9-9a36-dd3b28572d7a	Mobile App Development	Looking for an experienced developer to build a React Native app for food delivery. Need both iOS and Android versions.	Mobile Development	2000	5000	1-2 months	open	2	2025-08-13 16:57:11.158302
827e04d3-06e5-4af7-927e-d498813a424c	2aa4873a-8040-42fb-b2eb-1841554f89bd	I need a new house	shshs	location	200	300	1-3 days	open	1	2025-08-13 17:08:49.245255
259a2886-583c-40b7-9266-e60fdafe66da	2aa4873a-8040-42fb-b2eb-1841554f89bd	Website Design for E-commerce Store	Need a modern, responsive website design for my online clothing store. Looking for someone with experience in e-commerce UI/UX.	Web Design	500	1500	2-3 weeks	open	1	2025-08-13 16:57:11.158302
4d43bdfa-150f-4254-88c0-eb4abd83f418	2aa4873a-8040-42fb-b2eb-1841554f89bd	Logo Design and Branding	Need a professional logo design and complete branding package for my startup. Should include business cards and letterhead.	Graphic Design	200	800	1 week	open	1	2025-08-13 16:57:11.158302
e7ace354-637a-4fb2-8ddc-bf24ce3d1a76	2aa4873a-8040-42fb-b2eb-1841554f89bd	bhuihdihd	dnihdu dkjiodj dknmd 	product	22	222	1-3 days	approved	1	2025-08-13 17:17:57.39973
c9547ce8-7950-489f-9f93-25aa3c5be082	2aa4873a-8040-42fb-b2eb-1841554f89bd	I need a new rice supplier	Naira	information	20	200	1 week	open	1	2025-08-13 18:54:31.170204
req-001	11111111-1111-1111-1111-111111111111	Need a reliable CRM software for small business	Looking for a customer relationship management software that can handle 200+ contacts, email integration, and reporting features. Should be affordable and easy to use for a team of 5.	technology	50	300	2 weeks	open	2	2025-08-11 21:37:30.217428
req-002	33333333-3333-3333-3333-333333333333	Find industrial rice supplier in Lagos	Need a wholesale rice supplier for restaurant chain. Looking for premium quality rice, competitive pricing, and reliable delivery schedule. Must have proper certifications.	retail	500	2000	1 week	open	1	2025-08-12 21:37:30.217428
req-003	77777777-7777-7777-7777-777777777777	Social media marketing consultant needed	Looking for an experienced social media marketing consultant to help grow Instagram and TikTok presence for beauty brand. Need portfolio of similar work.	creative	200	800	3 weeks	in_progress	2	2025-08-10 21:37:30.217428
req-004	11111111-1111-1111-1111-111111111111	Custom mobile app developer	Need iOS/Android developer to create a fitness tracking app with wearable integration. Looking for someone with health app experience and good portfolio.	technology	2000	8000	2 months	open	3	2025-08-13 16:37:30.217428
req-005	2aa4873a-8040-42fb-b2eb-1841554f89bd	Local plumber for office renovation	Need experienced plumber for office bathroom renovation in downtown Chicago. Must be licensed, insured, and available next week.	local	300	800	1 week	completed	1	2025-08-06 21:37:30.217428
req-006	33333333-3333-3333-3333-333333333333	Corporate team building facilitator	Looking for professional team building facilitator for 50-person company retreat. Need creative activities and leadership development focus.	business	1000	3000	1 month	open	2	2025-08-13 15:37:30.217428
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, contract_id, client_id, finder_id, rating, comment, created_at) FROM stdin;
review-001	contract-001	33333333-3333-3333-3333-333333333333	f1111111-1111-1111-1111-111111111111	5	Excellent work! John found the perfect rice supplier with competitive pricing and excellent quality. Highly recommend his services.	2025-08-10 21:38:26.029523
review-002	contract-002	77777777-7777-7777-7777-777777777777	f7777777-7777-7777-7777-777777777777	4	Great social media strategy and very responsive communication. Looking forward to seeing the results of the campaign.	2025-08-12 21:38:26.029523
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tokens (id, finder_id, balance) FROM stdin;
b19dc52f-2190-41f3-870a-ae5cd0f690dd	1cdc2486-666b-41dd-bac1-eb0034977492	5
c1757c2a-dbcf-48ad-9f40-2f9a222ead54	a174fbbf-9c34-4788-8df7-38682459a2a9	5
230b28c2-9119-45d6-9782-3b549eb66360	a8c15eec-08b9-4e93-b911-46af8887471b	4
t2222222-2222-2222-2222-222222222222	f2222222-2222-2222-2222-222222222222	15
t4444444-4444-4444-4444-444444444444	f4444444-4444-4444-4444-444444444444	8
t6666666-6666-6666-6666-666666666666	f6666666-6666-6666-6666-666666666666	3
t1111111-1111-1111-1111-111111111111	f1111111-1111-1111-1111-111111111111	25
t7777777-7777-7777-7777-777777777777	f7777777-7777-7777-7777-777777777777	5
0dbb2cde-7117-4d4c-9726-00c57b2bc052	c88125ca-379a-4109-bfdb-86cb4f646d48	4
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, finder_id, amount, type, description, created_at) FROM stdin;
8f561aef-ec2c-45b8-9073-53c0ac9709b6	c88125ca-379a-4109-bfdb-86cb4f646d48	-1	proposal	Proposal submitted for request: e65be172-af49-440d-b1cd-9616d6a3428d	2025-08-13 16:18:16.591461
2fcaec64-2993-4e92-b66a-c9e408b3910b	c88125ca-379a-4109-bfdb-86cb4f646d48	-1	proposal	Proposal submitted for request: e65be172-af49-440d-b1cd-9616d6a3428d	2025-08-13 16:19:07.581932
0dd668dd-9449-41bc-93e8-e1e99f402b3a	a8c15eec-08b9-4e93-b911-46af8887471b	-1	proposal	Proposal submitted for request: 0091b198-2f07-4b12-906c-3fe87650af9c	2025-08-13 16:32:14.125941
9b141851-1094-41aa-a97c-55640de575d7	c88125ca-379a-4109-bfdb-86cb4f646d48	-1	proposal	Proposal submitted for request: 0091b198-2f07-4b12-906c-3fe87650af9c	2025-08-13 16:40:54.178052
58b69c38-788f-42ee-855f-d75f676bf820	c88125ca-379a-4109-bfdb-86cb4f646d48	-1	proposal	Proposal submitted for request: 5b9763f8-82ec-467f-b384-9da64d4f14f8	2025-08-13 16:42:08.270923
de083bfe-bcd9-4b1c-aed5-d1b9dd9d078c	c88125ca-379a-4109-bfdb-86cb4f646d48	-1	proposal	Proposal submitted for request: e7ace354-637a-4fb2-8ddc-bf24ce3d1a76	2025-08-13 17:22:07.76929
tx-001	f2222222-2222-2222-2222-222222222222	-2	proposal	Proposal submission for CRM Software request	2025-08-12 21:38:31.210154
tx-002	f4444444-4444-4444-4444-444444444444	-2	proposal	Proposal submission for CRM Software request	2025-08-13 03:38:31.210154
tx-003	f1111111-1111-1111-1111-111111111111	-1	proposal	Proposal submission for Rice Supplier request	2025-08-13 09:38:31.210154
tx-004	f7777777-7777-7777-7777-777777777777	-2	proposal	Proposal submission for Social Media Marketing request	2025-08-11 21:38:31.210154
tx-005	f1111111-1111-1111-1111-111111111111	10	purchase	Token purchase - 10 tokens for $50	2025-08-06 21:38:31.210154
tx-006	f2222222-2222-2222-2222-222222222222	20	purchase	Token purchase - 20 tokens for $100	2025-08-08 21:38:31.210154
362205ec-c0a0-4593-9072-54690dd8d83a	c88125ca-379a-4109-bfdb-86cb4f646d48	-1	proposal	Proposal submitted for request: c9547ce8-7950-489f-9f93-25aa3c5be082	2025-08-13 21:48:57.730739
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, first_name, last_name, role, is_verified, is_banned, created_at, phone, banned_reason, banned_at) FROM stdin;
a26fb44a-1534-4fe9-9a36-dd3b28572d7a	webintayo@gmail.com	$2b$10$XxbpAsaRjYkopHgrOaTiXOt41d7IkIHPBncvX1xLYVSiivWz0y3uK	Hammed	Temitayo	client	f	f	2025-08-13 14:34:39.169933	\N	\N	\N
d9da0f88-c3e8-488f-bc4e-5c68f6a2ca01	john.finder@test.com	$2b$10$FaNhzHo/Wgihj/tr36RJAOSkFCkV.vbspl4uGptEF.ljB4LMo8XPC	John	Finder	finder	f	f	2025-08-13 15:01:01.322148	\N	\N	\N
2aa4873a-8040-42fb-b2eb-1841554f89bd	client@test.com	$2b$10$8JlKL7V.BNvFGAfydxVWC.yE3JpA62.ibm0Pc46nzH1/g.m5qlo3G	Test	Client Teemma	client	f	f	2025-08-13 15:05:48.418944	356535353	\N	\N
78763947-ef7a-400c-a185-aba5864e962a	client1@test.com	$2b$10$TztTm5Z2Hf.y2/O92Wmsb.tyhHf1yUS/bmUVItPwjNnN0pu3qf8wm	Hammed	Client Teemma	finder	f	f	2025-08-13 16:09:40.611633	\N	\N	\N
9e32aaf4-c007-4f89-84fb-7c2cccbf3f80	terstfinder@example.com	$2b$10$lFRATIalbMEpSVRJm3eiOuqJKc1WWjoTtG0znLFj71Ki.6rzSckze	Ajala	Temitayo	finder	f	f	2025-08-13 16:31:16.27415	\N	\N	\N
15365b28-5646-4f3b-b51f-45bc6276d453	admin@findermeister.com	$2b$10$PNn1SkqhHrKWfY6mBNhMoO6VqyJZUrZH/ll08W4XI6eefurvphF.y	Admin	User	admin	f	f	2025-08-13 18:04:12.102228	\N	\N	\N
11111111-1111-1111-1111-111111111111	sarah.client@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	Sarah	Williams	client	t	f	2025-08-13 21:36:31.824498	+1-555-0123	\N	\N
22222222-2222-2222-2222-222222222222	mike.finder@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	Mike	Johnson	finder	t	f	2025-08-13 21:36:31.824498	+1-555-0124	\N	\N
33333333-3333-3333-3333-333333333333	lisa.client@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	Lisa	Chen	client	f	f	2025-08-13 21:36:31.824498	+1-555-0125	\N	\N
44444444-4444-4444-4444-444444444444	alex.finder@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	Alex	Rodriguez	finder	t	f	2025-08-13 21:36:31.824498	+1-555-0126	\N	\N
55555555-5555-5555-5555-555555555555	emma.client@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	Emma	Thompson	client	t	t	2025-08-13 21:36:31.824498	+1-555-0127	\N	\N
66666666-6666-6666-6666-666666666666	david.finder@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	David	Kim	finder	f	f	2025-08-13 21:36:31.824498	+1-555-0128	\N	\N
77777777-7777-7777-7777-777777777777	jane.client@demo.com	$2b$12$LQv3c1yqBWVHxkd0LQ4YCOuZiUiIJ9oCHY8DQoWt3WnWaoDuTbZxG	Jane	Smith	client	t	f	2025-08-13 21:36:31.824498	+1-555-0129	\N	\N
f27f2cf2-5c76-4673-8fd3-50cd34ce2a71	testfinder@example.com	$2b$10$KSDb4LrODSF5.k.d/n1huOnreeIHSXKjB565dvfPkl6zZwcRrdsG6	Test	Finder	finder	f	f	2025-08-13 16:08:17.52168	555-0123	\N	\N
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.withdrawal_requests (id, finder_id, amount, status, payment_method, payment_details, admin_notes, processed_by, requested_at, processed_at) FROM stdin;
withdraw-001	f1111111-1111-1111-1111-111111111111	500.00	pending	bank_transfer	{"bank_name": "Chase Bank", "account_number": "*****1234", "routing_number": "021000021", "account_holder": "John Finder"}	\N	\N	2025-08-10 21:38:22.479076	\N
withdraw-002	f2222222-2222-2222-2222-222222222222	250.00	approved	bank_transfer	{"bank_name": "Bank of America", "account_number": "*****5678", "routing_number": "011401533", "account_holder": "Mike Johnson"}	Processed successfully - payment sent via ACH	\N	2025-08-06 21:38:22.479076	\N
withdraw-003	f4444444-4444-4444-4444-444444444444	180.00	pending	paypal	{"email": "alex.finder@paypal.com", "account_verified": true}	\N	\N	2025-08-11 21:38:22.479076	\N
withdraw-004	f7777777-7777-7777-7777-777777777777	125.00	processing	bank_transfer	{"bank_name": "Wells Fargo", "account_number": "*****9012", "routing_number": "121042882", "account_holder": "Test Finder"}	Under review by finance team	\N	2025-08-12 21:38:22.479076	\N
\.


--
-- Name: admin_settings admin_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_key_unique UNIQUE (key);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: finders finders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finders
    ADD CONSTRAINT finders_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: requests requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: contracts contracts_client_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: contracts contracts_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: contracts contracts_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: contracts contracts_request_id_requests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_request_id_requests_id_fk FOREIGN KEY (request_id) REFERENCES public.requests(id);


--
-- Name: conversations conversations_client_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: conversations conversations_proposal_id_proposals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_proposal_id_proposals_id_fk FOREIGN KEY (proposal_id) REFERENCES public.proposals(id);


--
-- Name: finders finders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.finders
    ADD CONSTRAINT finders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: proposals proposals_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: proposals proposals_request_id_requests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_request_id_requests_id_fk FOREIGN KEY (request_id) REFERENCES public.requests(id);


--
-- Name: requests requests_client_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.requests
    ADD CONSTRAINT requests_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_client_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: reviews reviews_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: tokens tokens_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: transactions transactions_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: withdrawal_requests withdrawal_requests_finder_id_finders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_finder_id_finders_id_fk FOREIGN KEY (finder_id) REFERENCES public.finders(id);


--
-- Name: withdrawal_requests withdrawal_requests_processed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_processed_by_users_id_fk FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

