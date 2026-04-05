IF NOT EXISTS (SELECT 1 FROM HomePageBlocks WHERE [Key] = 'stats-default')
BEGIN
  INSERT INTO HomePageBlocks ([Key],[Type],[Title],[Subtitle],[ImageUrl],[CtaText],[CtaUrl],[ItemsJson],[Locale],[SortOrder],[IsPublished])
  VALUES ('stats-default','stats','Proof of outcomes','Highlights','','','',
  '[{"value":"120+","label":"Mentor hours","subLabel":"Weekly review cycles"},{"value":"95%","label":"Completion rate"},{"value":"50+","label":"Hiring partners"},{"value":"7d","label":"Project sprint","subLabel":"From brief to delivery"}]',
  'en',12,1)
END
IF NOT EXISTS (SELECT 1 FROM HomePageBlocks WHERE [Key] = 'stats-default-vi')
BEGIN
  INSERT INTO HomePageBlocks ([Key],[Type],[Title],[Subtitle],[ImageUrl],[CtaText],[CtaUrl],[ItemsJson],[Locale],[SortOrder],[IsPublished])
  VALUES ('stats-default-vi','stats',N'So lieu noi bat',N'Thanh tuu','','','',
  '[{"value":"120+","label":"Gio mentor","subLabel":"Review hang tuan"},{"value":"95%","label":"Ty le hoan thanh"},{"value":"50+","label":"Doi tac tuyen dung"},{"value":"7 ngay","label":"Sprint du an","subLabel":"Tu brief den delivery"}]',
  'vi',12,1)
END
IF NOT EXISTS (SELECT 1 FROM HomePageBlocks WHERE [Key] = 'testimonial-default')
BEGIN
  INSERT INTO HomePageBlocks ([Key],[Type],[Title],[Subtitle],[ImageUrl],[CtaText],[CtaUrl],[ItemsJson],[Locale],[SortOrder],[IsPublished])
  VALUES ('testimonial-default','testimonial','Learners share the impact','Testimonials','','','',
  '[{"quote":"Clear feedback loops and practical projects kept me shipping every week.","name":"Minh Tran","role":"Product Designer","company":"Fintech"},{"quote":"The mentor sessions felt like real product reviews - super actionable.","name":"Le Quang","role":"Frontend Engineer","company":"SaaS"},{"quote":"I finally built a portfolio case study I am proud to show.","name":"Ngoc Anh","role":"Business Analyst","company":"Consulting"}]',
  'en',14,1)
END
IF NOT EXISTS (SELECT 1 FROM HomePageBlocks WHERE [Key] = 'testimonial-default-vi')
BEGIN
  INSERT INTO HomePageBlocks ([Key],[Type],[Title],[Subtitle],[ImageUrl],[CtaText],[CtaUrl],[ItemsJson],[Locale],[SortOrder],[IsPublished])
  VALUES ('testimonial-default-vi','testimonial',N'Hoc vien noi gi',N'Danh gia','','','',
  '[{"quote":"Co feedback ro rang nen tuan nao minh cung ship du an.","name":"Minh Tran","role":"Product Designer","company":"Fintech"},{"quote":"Mentor review nhu review san pham that, rat de ap dung.","name":"Le Quang","role":"Frontend Engineer","company":"SaaS"},{"quote":"Lan dau tien minh co case study portfolio day du.","name":"Ngoc Anh","role":"Business Analyst","company":"Consulting"}]',
  'vi',14,1)
END
