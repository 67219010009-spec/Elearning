--
-- PostgreSQL database dump
--

\restrict PiczWTtxhF9xlsdTCA25wxmdbs5vewNgrUZhS5mqBFdBCtdpbdHZsACFwm6JXup

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: elearning
--

CREATE TABLE public.analytics_events (
    id bigint NOT NULL,
    visitor_id uuid NOT NULL,
    page_type character varying(20) NOT NULL,
    course_id integer,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT analytics_events_check CHECK (((((page_type)::text = 'course'::text) AND (course_id IS NOT NULL)) OR (((page_type)::text = 'site'::text) AND (course_id IS NULL)))),
    CONSTRAINT analytics_events_page_type_check CHECK (((page_type)::text = ANY ((ARRAY['site'::character varying, 'course'::character varying])::text[])))
);


ALTER TABLE public.analytics_events OWNER TO elearning;

--
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: elearning
--

CREATE SEQUENCE public.analytics_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_events_id_seq OWNER TO elearning;

--
-- Name: analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elearning
--

ALTER SEQUENCE public.analytics_events_id_seq OWNED BY public.analytics_events.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: elearning
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    instructor_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO elearning;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: elearning
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO elearning;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elearning
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: elearning
--

CREATE TABLE public.enrollments (
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.enrollments OWNER TO elearning;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: elearning
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    course_id integer NOT NULL,
    title character varying(200) NOT NULL,
    type character varying(10) NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lessons_type_check CHECK (((type)::text = ANY ((ARRAY['video'::character varying, 'pdf'::character varying, 'link'::character varying, 'text'::character varying])::text[])))
);


ALTER TABLE public.lessons OWNER TO elearning;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: elearning
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO elearning;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elearning
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: progress; Type: TABLE; Schema: public; Owner: elearning
--

CREATE TABLE public.progress (
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.progress OWNER TO elearning;

--
-- Name: users; Type: TABLE; Schema: public; Owner: elearning
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'instructor'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO elearning;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: elearning
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO elearning;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: elearning
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: analytics_events id; Type: DEFAULT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.analytics_events ALTER COLUMN id SET DEFAULT nextval('public.analytics_events_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: elearning
--

COPY public.analytics_events (id, visitor_id, page_type, course_id, viewed_at) FROM stdin;
1	123e4567-e89b-42d3-a456-426614174000	site	\N	2026-11-25 04:04:01.960062+00
2	5b103dd5-ea23-4bd7-abfe-8b6042ecd413	site	\N	2026-11-25 04:04:17.43955+00
3	5b103dd5-ea23-4bd7-abfe-8b6042ecd413	site	\N	2026-11-25 04:04:17.440168+00
4	5b103dd5-ea23-4bd7-abfe-8b6042ecd413	site	\N	2026-11-25 04:05:03.958098+00
5	5b103dd5-ea23-4bd7-abfe-8b6042ecd413	site	\N	2026-11-25 04:05:03.95885+00
6	5b103dd5-ea23-4bd7-abfe-8b6042ecd413	site	\N	2026-11-25 04:09:38.060045+00
7	5b103dd5-ea23-4bd7-abfe-8b6042ecd413	site	\N	2026-11-25 04:09:38.061598+00
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: elearning
--

COPY public.courses (id, title, description, instructor_id, created_at) FROM stdin;
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: elearning
--

COPY public.enrollments (user_id, course_id, enrolled_at) FROM stdin;
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: elearning
--

COPY public.lessons (id, course_id, title, type, content, "position", created_at) FROM stdin;
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: elearning
--

COPY public.progress (user_id, lesson_id, completed_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: elearning
--

COPY public.users (id, name, email, password_hash, role, created_at) FROM stdin;
1	ผู้ดูแลระบบ	admin@example.com	$2a$10$788HcoxVM6b7Dy3Xy7N86.EJTV2D4PbypWqqm12jIFOiNNM7wCjTK	admin	2026-11-25 03:35:36.480151+00
2	อาจารย์ตัวอย่าง	teacher@example.com	$2a$10$/Aiz/Av8iEHEYAhmOD9HBe4meYTD9cQGeDuYLAk83zRSVpzh20KlC	instructor	2026-11-25 03:35:36.706398+00
3	นักเรียนตัวอย่าง	student@example.com	$2a$10$G6g2U4ERZn2Dp/M4b4.3z.ESlF8REpQ8.H1XSlQM/gjW6PvHyWJHe	student	2026-11-25 03:35:36.919311+00
\.


--
-- Name: analytics_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elearning
--

SELECT pg_catalog.setval('public.analytics_events_id_seq', 7, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elearning
--

SELECT pg_catalog.setval('public.courses_id_seq', 1, false);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elearning
--

SELECT pg_catalog.setval('public.lessons_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: elearning
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (user_id, course_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (user_id, lesson_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_analytics_viewed_at; Type: INDEX; Schema: public; Owner: elearning
--

CREATE INDEX idx_analytics_viewed_at ON public.analytics_events USING btree (viewed_at);


--
-- Name: idx_analytics_visitor; Type: INDEX; Schema: public; Owner: elearning
--

CREATE INDEX idx_analytics_visitor ON public.analytics_events USING btree (visitor_id);


--
-- Name: idx_courses_instructor; Type: INDEX; Schema: public; Owner: elearning
--

CREATE INDEX idx_courses_instructor ON public.courses USING btree (instructor_id);


--
-- Name: idx_lessons_course; Type: INDEX; Schema: public; Owner: elearning
--

CREATE INDEX idx_lessons_course ON public.lessons USING btree (course_id, "position");


--
-- Name: analytics_events analytics_events_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: progress progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: progress progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: elearning
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PiczWTtxhF9xlsdTCA25wxmdbs5vewNgrUZhS5mqBFdBCtdpbdHZsACFwm6JXup

