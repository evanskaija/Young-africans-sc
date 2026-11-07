-- Verified records for the local/prototype fixture feed.
-- Apply after schema.sql. Production records should continue to be maintained in the protected CMS.

INSERT INTO fixture_teams (id, team_category, team_name, crest_url, is_yanga) VALUES
('8d1a3e2f-6b6f-4d77-8b5b-100000000001', 'MEN', 'Young Africans', '/young-africansc.png', TRUE),
('8d1a3e2f-6b6f-4d77-8b5b-100000000002', 'WOMEN', 'Yanga Princess', '/young-africansc.png', TRUE),
('8d1a3e2f-6b6f-4d77-8b5b-100000000003', 'UNDER_20', 'Young Africans SC U20', '/young-africansc.png', TRUE)
ON CONFLICT (team_category, team_name) DO UPDATE SET crest_url = EXCLUDED.crest_url, is_yanga = EXCLUDED.is_yanga, updated_at = NOW();

INSERT INTO fixtures (
  id, team_category, season, is_published, club_side, competition, home_team, away_team,
  kickoff_at, kickoff_time_confirmed, venue, status, home_score, away_score,
  official_details_url, notes
) VALUES
('8d1a3e2f-6b6f-4d77-8b5b-000000000001', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'Polisi Tanzania', 'Young Africans', '2026-11-20 16:00:00+03', TRUE, 'Ushirika Stadium, Kilimanjaro', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000002', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Kagera Sugar', '2026-11-01 00:00:00+03', FALSE, 'Official venue record pending', 'COMPLETED', 4, 0, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league result; kickoff time was not published in the source.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000003', 'WOMEN', '2026/27', TRUE, 'AWAY', 'Ngao ya Jamii Wanawake 2026', 'Simba Queens', 'Yanga Princess', '2026-09-30 18:00:00+03', TRUE, 'KMC Complex, Dar es Salaam', 'COMPLETED', 3, 0, 'https://tff.or.tz/simba-queens-jkt-queens-kukutana-fainali-ngao-ya-jamii-wanawake/', 'Verified TFF result.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000004', 'WOMEN', '2026/27', TRUE, 'AWAY', 'TWPL 2026/2027', 'Bunda Girls', 'Yanga Princess', '2026-10-28 00:00:00+03', FALSE, 'Karume Stadium, Mara', 'COMPLETED', 0, 3, 'https://tff.or.tz/bunda-queens-yaanza-na-rekodi-ligi-ya-wanawake-2026-2027/', 'Verified TFF result; kickoff time was not published in the source.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000005', 'UNDER_20', '2025/26', TRUE, 'HOME', 'NBC Youth League', 'Young Africans SC U20', 'Fountain Gate FC U20', '2025-12-20 00:00:00+03', FALSE, 'TFF Technical Centre, Dar es Salaam', 'COMPLETED', 3, 1, 'https://tff.or.tz/nbc-youth-yaingia-raundi-ya-nne/', 'Verified TFF report; kickoff time was not published in the source.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000006', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'Singida Black Stars', 'Young Africans', '2026-12-12 18:30:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000007', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'Azam FC', 'Young Africans', '2026-12-30 19:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000008', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Polisi Tanzania FC', '2027-02-03 21:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000009', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Simba SC', '2027-02-06 19:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000010', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'Mashujaa FC', 'Young Africans', '2027-02-11 16:15:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000011', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'Kagera Sugar FC', 'Young Africans', '2027-02-17 19:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000012', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Dodoma Jiji FC', '2027-02-24 18:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000013', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Mbeya City', '2027-03-12 19:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000014', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'Pamba Jiji FC', 'Young Africans', '2027-04-06 16:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000015', 'MEN', '2026/27', TRUE, 'AWAY', 'NBC Premier League 2026/2027', 'JKT Tanzania SC', 'Young Africans', '2027-05-03 16:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000016', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Namungo FC', '2027-05-12 16:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000017', 'MEN', '2026/27', TRUE, 'HOME', 'NBC Premier League 2026/2027', 'Young Africans', 'Singida Black Stars', '2027-05-16 16:00:00+03', TRUE, 'Official venue record pending', 'SCHEDULED', NULL, NULL, 'https://ligikuu.co.tz/team/young-africans-sc/', 'Verified league fixture.'),
('8d1a3e2f-6b6f-4d77-8b5b-000000000018', 'WOMEN', '2026/27', TRUE, 'AWAY', 'TWPL 2026/2027', 'Geita Queens', 'Yanga Princess', '2026-11-04 00:00:00+03', FALSE, 'Nyankumbu Stadium, Geita', 'COMPLETED', 0, 2, 'https://tff.or.tz/simba-queens-yanga-princess-hawakamatiki-twpl/', 'Verified TFF result; kickoff time was not published in the source.')
ON CONFLICT (id) DO UPDATE SET
  team_category = EXCLUDED.team_category,
  season = EXCLUDED.season,
  is_published = EXCLUDED.is_published,
  club_side = EXCLUDED.club_side,
  competition = EXCLUDED.competition,
  home_team = EXCLUDED.home_team,
  away_team = EXCLUDED.away_team,
  kickoff_at = EXCLUDED.kickoff_at,
  kickoff_time_confirmed = EXCLUDED.kickoff_time_confirmed,
  venue = EXCLUDED.venue,
  status = EXCLUDED.status,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  official_details_url = EXCLUDED.official_details_url,
  notes = EXCLUDED.notes,
  updated_at = NOW();
