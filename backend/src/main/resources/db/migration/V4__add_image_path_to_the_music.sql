ALTER TABLE music ADD COLUMN image_path VARCHAR(500) AFTER file_path;

UPDATE music SET image_path = '/images/birthday_star.png' WHERE title = 'Birthday Star';
UPDATE music SET image_path = '/images/combo.png' WHERE title = 'Combo';
UPDATE music SET image_path = '/images/rock.png' WHERE title = 'Rock';
UPDATE music SET image_path = '/images/sungsimdang.png' WHERE title = 'Sungsimdang';