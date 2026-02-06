
USE lifeline_db;

-- BANGLADESH LOCATION DATA - ALL 64 DISTRICTS

-- Insert All 64 Zillas (Districts) of Bangladesh
INSERT INTO zillas (name) VALUES
-- Dhaka Division
('Dhaka'), ('Faridpur'), ('Gazipur'), ('Gopalganj'), ('Kishoreganj'), ('Madaripur'), ('Manikganj'), ('Munshiganj'), ('Narayanganj'), ('Narsingdi'), ('Rajbari'), ('Shariatpur'), ('Tangail'),
-- Chittagong Division
('Chittagong'), ('Bandarban'), ('Brahmanbaria'), ('Chandpur'), ('Comilla'), ('Cox''s Bazar'), ('Feni'), ('Khagrachari'), ('Lakshmipur'), ('Noakhali'), ('Rangamati'),
-- Rajshahi Division
('Rajshahi'), ('Bogra'), ('Joypurhat'), ('Naogaon'), ('Natore'), ('Chapainawabganj'), ('Pabna'), ('Sirajganj'),
-- Khulna Division
('Khulna'), ('Bagerhat'), ('Chuadanga'), ('Jessore'), ('Jhenaidah'), ('Kushtia'), ('Magura'), ('Meherpur'), ('Narail'), ('Satkhira'),
-- Barisal Division
('Barisal'), ('Barguna'), ('Bhola'), ('Jhalokati'), ('Patuakhali'), ('Pirojpur'),
-- Sylhet Division
('Sylhet'), ('Habiganj'), ('Moulvibazar'), ('Sunamganj'),
-- Rangpur Division
('Rangpur'), ('Dinajpur'), ('Gaibandha'), ('Kurigram'), ('Lalmonirhat'), ('Nilphamari'), ('Panchagarh'), ('Thakurgaon'),
-- Mymensingh Division
('Mymensingh'), ('Jamalpur'), ('Netrokona'), ('Sherpur');

-- Insert Thanas/Upazilas for All Zillas
-- DHAKA DIVISION

-- Dhaka (id: 1) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(1, 'Adabor'), (1, 'Badda'), (1, 'Banani'), (1, 'Bangshal'), (1, 'Bhashantek'), (1, 'Cantonment'), (1, 'Chawkbazar'), (1, 'Dakshinkhan'), (1, 'Darus Salam'), (1, 'Demra'), (1, 'Dhanmondi'), (1, 'Gendaria'), (1, 'Gulshan'), (1, 'Hazaribagh'), (1, 'Jatrabari'), (1, 'Kafrul'), (1, 'Kadamtali'), (1, 'Kalabagan'), (1, 'Kamrangirchar'), (1, 'Khilgaon'), (1, 'Khilkhet'), (1, 'Kotwali'), (1, 'Lalbagh'), (1, 'Mirpur Model'), (1, 'Mohammadpur'), (1, 'Motijheel'), (1, 'Mugda'), (1, 'New Market'), (1, 'Pallabi'), (1, 'Paltan'), (1, 'Ramna'), (1, 'Rampura'), (1, 'Sabujbagh'), (1, 'Shah Ali'), (1, 'Shahbagh'), (1, 'Shahjahanpur'), (1, 'Sher-e-Bangla Nagar'), (1, 'Shyampur'), (1, 'Sutrapur'), (1, 'Tejgaon'), (1, 'Tejgaon Industrial Area'), (1, 'Turag'), (1, 'Uttara East'), (1, 'Uttara West'), (1, 'Uttarkhan'), (1, 'Vatara'), (1, 'Wari'),
-- Upazilas
(1, 'Dhamrai'), (1, 'Dohar'), (1, 'Keraniganj'), (1, 'Nawabganj'), (1, 'Savar');

-- Faridpur (id: 2)
INSERT INTO thanas (zilla_id, name) VALUES
(2, 'Faridpur Sadar'), (2, 'Alfadanga'), (2, 'Bhanga'), (2, 'Boalmari'), (2, 'Charbhadrasan'), (2, 'Madhukhali'), (2, 'Nagarkanda'), (2, 'Sadarpur'), (2, 'Saltha');

-- Gazipur (id: 3) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(3, 'Joydebpur'), (3, 'Tongi East'), (3, 'Tongi West'),
-- Upazilas
(3, 'Gazipur Sadar'), (3, 'Kaliakair'), (3, 'Kaliganj'), (3, 'Kapasia'), (3, 'Sreepur');

-- Gopalganj (id: 4)
INSERT INTO thanas (zilla_id, name) VALUES
(4, 'Gopalganj Sadar'), (4, 'Kashiani'), (4, 'Kotalipara'), (4, 'Muksudpur'), (4, 'Tungipara');

-- Kishoreganj (id: 5)
INSERT INTO thanas (zilla_id, name) VALUES
(5, 'Kishoreganj Sadar'), (5, 'Austagram'), (5, 'Bajitpur'), (5, 'Bhairab'), (5, 'Hossainpur'), (5, 'Itna'), (5, 'Karimganj'), (5, 'Katiadi'), (5, 'Kuliarchar'), (5, 'Mithamain'), (5, 'Nikli'), (5, 'Pakundia'), (5, 'Tarail');

-- Madaripur (id: 6)
INSERT INTO thanas (zilla_id, name) VALUES
(6, 'Madaripur Sadar'), (6, 'Kalkini'), (6, 'Rajoir'), (6, 'Shibchar');

-- Manikganj (id: 7)
INSERT INTO thanas (zilla_id, name) VALUES
(7, 'Manikganj Sadar'), (7, 'Daulatpur'), (7, 'Ghior'), (7, 'Harirampur'), (7, 'Saturia'), (7, 'Shibalaya'), (7, 'Singair');

-- Munshiganj (id: 8)
INSERT INTO thanas (zilla_id, name) VALUES
(8, 'Munshiganj Sadar'), (8, 'Gazaria'), (8, 'Lohajang'), (8, 'Sirajdikhan'), (8, 'Sreenagar'), (8, 'Tongibari');

-- Narayanganj (id: 9) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(9, 'Fatullah'), (9, 'Narayanganj Sadar'), (9, 'Siddhirganj'),
-- Upazilas
(9, 'Araihazar'), (9, 'Bandar'), (9, 'Rupganj'), (9, 'Sonargaon');

-- Narsingdi (id: 10)
INSERT INTO thanas (zilla_id, name) VALUES
(10, 'Narsingdi Sadar'), (10, 'Belabo'), (10, 'Monohardi'), (10, 'Palash'), (10, 'Raipura'), (10, 'Shibpur');

-- Rajbari (id: 11)
INSERT INTO thanas (zilla_id, name) VALUES
(11, 'Rajbari Sadar'), (11, 'Baliakandi'), (11, 'Goalandaghat'), (11, 'Pangsha'), (11, 'Kalukhali');

-- Shariatpur (id: 12)
INSERT INTO thanas (zilla_id, name) VALUES
(12, 'Shariatpur Sadar'), (12, 'Bhedarganj'), (12, 'Damudya'), (12, 'Gosairhat'), (12, 'Naria'), (12, 'Zajira');

-- Tangail (id: 13)
INSERT INTO thanas (zilla_id, name) VALUES
(13, 'Tangail Sadar'), (13, 'Basail'), (13, 'Bhuapur'), (13, 'Delduar'), (13, 'Dhanbari'), (13, 'Ghatail'), (13, 'Gopalpur'), (13, 'Kalihati'), (13, 'Madhupur'), (13, 'Mirzapur'), (13, 'Nagarpur'), (13, 'Sakhipur');

-- CHITTAGONG DIVISION

-- Chittagong (id: 14) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(14, 'Akbar Shah'), (14, 'Bakalia'), (14, 'Bandar'), (14, 'Bayazid Bostami'), (14, 'Chandgaon'), (14, 'Chawkbazar'), (14, 'Double Mooring'), (14, 'EPZ'), (14, 'Halishahar'), (14, 'Khulshi'), (14, 'Kotwali'), (14, 'Kulshi'), (14, 'Pahartali'), (14, 'Panchlaish'), (14, 'Patenga'), (14, 'Sadarghat'),
-- Upazilas
(14, 'Anwara'), (14, 'Banshkhali'), (14, 'Boalkhali'), (14, 'Chandanaish'), (14, 'Fatikchhari'), (14, 'Hathazari'), (14, 'Lohagara'), (14, 'Mirsharai'), (14, 'Patiya'), (14, 'Rangunia'), (14, 'Raozan'), (14, 'Sandwip'), (14, 'Satkania'), (14, 'Sitakunda');

-- Bandarban (id: 15)
INSERT INTO thanas (zilla_id, name) VALUES
(15, 'Bandarban Sadar'), (15, 'Alikadam'), (15, 'Lama'), (15, 'Naikhongchhari'), (15, 'Rowangchhari'), (15, 'Ruma'), (15, 'Thanchi');

-- Brahmanbaria (id: 16)
INSERT INTO thanas (zilla_id, name) VALUES
(16, 'Brahmanbaria Sadar'), (16, 'Akhaura'), (16, 'Ashuganj'), (16, 'Bancharampur'), (16, 'Bijoynagar'), (16, 'Kasba'), (16, 'Nabinagar'), (16, 'Nasirnagar'), (16, 'Sarail');

-- Chandpur (id: 17)
INSERT INTO thanas (zilla_id, name) VALUES
(17, 'Chandpur Sadar'), (17, 'Faridganj'), (17, 'Haimchar'), (17, 'Haziganj'), (17, 'Kachua'), (17, 'Matlab Dakshin'), (17, 'Matlab Uttar'), (17, 'Shahrasti');

-- Comilla (id: 18) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(18, 'Kotwali'), (18, 'Laksam'),
-- Upazilas
(18, 'Comilla Sadar'), (18, 'Barura'), (18, 'Brahmanpara'), (18, 'Burichang'), (18, 'Chandina'), (18, 'Chauddagram'), (18, 'Daudkandi'), (18, 'Debidwar'), (18, 'Homna'), (18, 'Laksam'), (18, 'Meghna'), (18, 'Muradnagar'), (18, 'Nangalkot'), (18, 'Titas');

-- Cox's Bazar (id: 19) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(19, 'Cox''s Bazar Sadar'), (19, 'Kotwali'),
-- Upazilas
(19, 'Chakaria'), (19, 'Kutubdia'), (19, 'Maheshkhali'), (19, 'Pekua'), (19, 'Ramu'), (19, 'Teknaf'), (19, 'Ukhia');

-- Feni (id: 20)
INSERT INTO thanas (zilla_id, name) VALUES
(20, 'Feni Sadar'), (20, 'Chhagalnaiya'), (20, 'Daganbhuiyan'), (20, 'Fulgazi'), (20, 'Parshuram'), (20, 'Sonagazi');

-- Khagrachari (id: 21)
INSERT INTO thanas (zilla_id, name) VALUES
(21, 'Khagrachari Sadar'), (21, 'Dighinala'), (21, 'Lakshmichhari'), (21, 'Mahalchhari'), (21, 'Manikchhari'), (21, 'Matiranga'), (21, 'Panchhari'), (21, 'Ramgarh');

-- Lakshmipur (id: 22)
INSERT INTO thanas (zilla_id, name) VALUES
(22, 'Lakshmipur Sadar'), (22, 'Kamalnagar'), (22, 'Raipur'), (22, 'Ramganj'), (22, 'Ramgati');

-- Noakhali (id: 23)
INSERT INTO thanas (zilla_id, name) VALUES
(23, 'Noakhali Sadar'), (23, 'Begumganj'), (23, 'Chatkhil'), (23, 'Companiganj'), (23, 'Hatiya'), (23, 'Kabirhat'), (23, 'Senbagh'), (23, 'Sonaimuri'), (23, 'Subarnachar');

-- Rangamati (id: 24)
INSERT INTO thanas (zilla_id, name) VALUES
(24, 'Rangamati Sadar'), (24, 'Baghaichhari'), (24, 'Barkal'), (24, 'Belaichhari'), (24, 'Juraichhari'), (24, 'Kaptai'), (24, 'Kawkhali'), (24, 'Langadu'), (24, 'Naniarchar'), (24, 'Rajasthali');

-- RAJSHAHI DIVISION

-- Rajshahi (id: 25) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(25, 'Boalia'), (25, 'Chandrima'), (25, 'Matihar'), (25, 'Rajpara'), (25, 'Shah Makhdum'),
-- Upazilas
(25, 'Rajshahi Sadar'), (25, 'Bagha'), (25, 'Bagmara'), (25, 'Charghat'), (25, 'Durgapur'), (25, 'Godagari'), (25, 'Mohanpur'), (25, 'Paba'), (25, 'Puthia'), (25, 'Tanore');

-- Bogra (id: 26) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(26, 'Airport'), (26, 'Kotwali'), (26, 'Sadar'),
-- Upazilas
(26, 'Bogra Sadar'), (26, 'Adamdighi'), (26, 'Dhunat'), (26, 'Dhupchanchia'), (26, 'Gabtali'), (26, 'Kahaloo'), (26, 'Nandigram'), (26, 'Sariakandi'), (26, 'Shajahanpur'), (26, 'Sherpur'), (26, 'Shibganj'), (26, 'Sonatola');

-- Joypurhat (id: 27)
INSERT INTO thanas (zilla_id, name) VALUES
(27, 'Joypurhat Sadar'), (27, 'Akkelpur'), (27, 'Kalai'), (27, 'Khetlal'), (27, 'Panchbibi');

-- Naogaon (id: 28)
INSERT INTO thanas (zilla_id, name) VALUES
(28, 'Naogaon Sadar'), (28, 'Atrai'), (28, 'Badalgachhi'), (28, 'Dhamoirhat'), (28, 'Manda'), (28, 'Mahadebpur'), (28, 'Niamatpur'), (28, 'Patnitala'), (28, 'Porsha'), (28, 'Raninagar'), (28, 'Sapahar');

-- Natore (id: 29)
INSERT INTO thanas (zilla_id, name) VALUES
(29, 'Natore Sadar'), (29, 'Bagatipara'), (29, 'Baraigram'), (29, 'Gurudaspur'), (29, 'Lalpur'), (29, 'Natore Sadar'), (29, 'Singra');

-- Chapainawabganj (id: 30)
INSERT INTO thanas (zilla_id, name) VALUES
(30, 'Chapainawabganj Sadar'), (30, 'Bholahat'), (30, 'Gomastapur'), (30, 'Nachole'), (30, 'Shibganj');

-- Pabna (id: 31)
INSERT INTO thanas (zilla_id, name) VALUES
(31, 'Pabna Sadar'), (31, 'Atgharia'), (31, 'Bera'), (31, 'Bhangura'), (31, 'Chatmohar'), (31, 'Faridpur'), (31, 'Ishwardi'), (31, 'Santhia'), (31, 'Sujanagar');

-- Sirajganj (id: 32)
INSERT INTO thanas (zilla_id, name) VALUES
(32, 'Sirajganj Sadar'), (32, 'Belkuchi'), (32, 'Chauhali'), (32, 'Kamarkhanda'), (32, 'Kazipur'), (32, 'Raiganj'), (32, 'Shahjadpur'), (32, 'Tarash'), (32, 'Ullahpara');

-- KHULNA DIVISION

-- Khulna (id: 33) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(33, 'Aranghata'), (33, 'Daulatpur'), (33, 'Khalishpur'), (33, 'Khan Jahan Ali'), (33, 'Kotwali'), (33, 'Labanchora'), (33, 'Sonadanga'),
-- Upazilas
(33, 'Khulna Sadar'), (33, 'Batiaghata'), (33, 'Dacope'), (33, 'Dumuria'), (33, 'Dighalia'), (33, 'Koyra'), (33, 'Paikgachha'), (33, 'Phultala'), (33, 'Rupsa'), (33, 'Terokhada');

-- Bagerhat (id: 34)
INSERT INTO thanas (zilla_id, name) VALUES
(34, 'Bagerhat Sadar'), (34, 'Chitalmari'), (34, 'Fakirhat'), (34, 'Kachua'), (34, 'Mollahat'), (34, 'Mongla'), (34, 'Morrelganj'), (34, 'Rampal'), (34, 'Sarankhola');

-- Chuadanga (id: 35)
INSERT INTO thanas (zilla_id, name) VALUES
(35, 'Chuadanga Sadar'), (35, 'Alamdanga'), (35, 'Damurhuda'), (35, 'Jibannagar');

-- Jessore (id: 36) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(36, 'Kotwali'), (36, 'Sadar'),
-- Upazilas
(36, 'Jessore Sadar'), (36, 'Abhaynagar'), (36, 'Bagherpara'), (36, 'Chaugachha'), (36, 'Jhikargachha'), (36, 'Keshabpur'), (36, 'Manirampur'), (36, 'Sharsha');

-- Jhenaidah (id: 37)
INSERT INTO thanas (zilla_id, name) VALUES
(37, 'Jhenaidah Sadar'), (37, 'Harinakunda'), (37, 'Kaliganj'), (37, 'Kotchandpur'), (37, 'Maheshpur'), (37, 'Shailkupa');

-- Kushtia (id: 38)
INSERT INTO thanas (zilla_id, name) VALUES
(38, 'Kushtia Sadar'), (38, 'Bheramara'), (38, 'Daulatpur'), (38, 'Khoksa'), (38, 'Kumarkhali'), (38, 'Mirpur');

-- Magura (id: 39)
INSERT INTO thanas (zilla_id, name) VALUES
(39, 'Magura Sadar'), (39, 'Mohammadpur'), (39, 'Shalikha'), (39, 'Sreepur');

-- Meherpur (id: 40)
INSERT INTO thanas (zilla_id, name) VALUES
(40, 'Meherpur Sadar'), (40, 'Gangni'), (40, 'Mujibnagar');

-- Narail (id: 41)
INSERT INTO thanas (zilla_id, name) VALUES
(41, 'Narail Sadar'), (41, 'Kalia'), (41, 'Lohagara');

-- Satkhira (id: 42)
INSERT INTO thanas (zilla_id, name) VALUES
(42, 'Satkhira Sadar'), (42, 'Assasuni'), (42, 'Debhata'), (42, 'Kalaroa'), (42, 'Kaliganj'), (42, 'Shyamnagar'), (42, 'Tala');

-- BARISAL DIVISION

-- Barisal (id: 43) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(43, 'Airport'), (43, 'Kawnia'), (43, 'Kotwali'), (43, 'Nathullabad'),
-- Upazilas
(43, 'Barisal Sadar'), (43, 'Agailjhara'), (43, 'Babuganj'), (43, 'Bakerganj'), (43, 'Banaripara'), (43, 'Gaurnadi'), (43, 'Hizla'), (43, 'Mehendiganj'), (43, 'Muladi'), (43, 'Wazirpur');

-- Barguna (id: 44)
INSERT INTO thanas (zilla_id, name) VALUES
(44, 'Barguna Sadar'), (44, 'Amtali'), (44, 'Bamna'), (44, 'Betagi'), (44, 'Patharghata'), (44, 'Taltali');

-- Bhola (id: 45)
INSERT INTO thanas (zilla_id, name) VALUES
(45, 'Bhola Sadar'), (45, 'Burhanuddin'), (45, 'Char Fasson'), (45, 'Daulatkhan'), (45, 'Lalmohan'), (45, 'Manpura'), (45, 'Tazumuddin');

-- Jhalokati (id: 46)
INSERT INTO thanas (zilla_id, name) VALUES
(46, 'Jhalokati Sadar'), (46, 'Kathalia'), (46, 'Nalchity'), (46, 'Rajapur');

-- Patuakhali (id: 47)
INSERT INTO thanas (zilla_id, name) VALUES
(47, 'Patuakhali Sadar'), (47, 'Bauphal'), (47, 'Dashmina'), (47, 'Dumki'), (47, 'Galachipa'), (47, 'Kalapara'), (47, 'Mirzaganj'), (47, 'Rangabali');

-- Pirojpur (id: 48)
INSERT INTO thanas (zilla_id, name) VALUES
(48, 'Pirojpur Sadar'), (48, 'Bhandaria'), (48, 'Kawkhali'), (48, 'Mathbaria'), (48, 'Nazirpur'), (48, 'Nesarabad'), (48, 'Zianagar');

-- SYLHET DIVISION

-- Sylhet (id: 49) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(49, 'Airport'), (49, 'Jalalabad'), (49, 'Kotwali'), (49, 'Moglabazar'), (49, 'Shahporan'), (49, 'South Surma'),
-- Upazilas
(49, 'Sylhet Sadar'), (49, 'Balaganj'), (49, 'Beanibazar'), (49, 'Bishwanath'), (49, 'Companiganj'), (49, 'Dakshin Surma'), (49, 'Fenchuganj'), (49, 'Golapganj'), (49, 'Gowainghat'), (49, 'Jaintiapur'), (49, 'Kanaighat'), (49, 'Zakiganj');

-- Habiganj (id: 50)
INSERT INTO thanas (zilla_id, name) VALUES
(50, 'Habiganj Sadar'), (50, 'Ajmiriganj'), (50, 'Bahubal'), (50, 'Baniyachong'), (50, 'Chunarughat'), (50, 'Lakhai'), (50, 'Madhabpur'), (50, 'Nabiganj'), (50, 'Sayestaganj');

-- Moulvibazar (id: 51)
INSERT INTO thanas (zilla_id, name) VALUES
(51, 'Moulvibazar Sadar'), (51, 'Barlekha'), (51, 'Juri'), (51, 'Kamalganj'), (51, 'Kulaura'), (51, 'Rajnagar'), (51, 'Sreemangal');

-- Sunamganj (id: 52)
INSERT INTO thanas (zilla_id, name) VALUES
(52, 'Sunamganj Sadar'), (52, 'Bishwambarpur'), (52, 'Chhatak'), (52, 'Derai'), (52, 'Dharamapasha'), (52, 'Dowarabazar'), (52, 'Jagannathpur'), (52, 'Jamalganj'), (52, 'Sulla'), (52, 'Tahirpur');

-- RANGPUR DIVISION

-- Rangpur (id: 53) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(53, 'Kotwali'), (53, 'Mahiganj'), (53, 'Tajhat'),
-- Upazilas
(53, 'Rangpur Sadar'), (53, 'Badarganj'), (53, 'Gangachara'), (53, 'Kaunia'), (53, 'Mithapukur'), (53, 'Pirgachha'), (53, 'Pirganj'), (53, 'Taraganj');

-- Dinajpur (id: 54) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(54, 'Kotwali'), (54, 'Sadar'),
-- Upazilas
(54, 'Dinajpur Sadar'), (54, 'Birampur'), (54, 'Birganj'), (54, 'Biral'), (54, 'Bochaganj'), (54, 'Chirirbandar'), (54, 'Fulbari'), (54, 'Ghoraghat'), (54, 'Hakimpur'), (54, 'Kaharole'), (54, 'Khansama'), (54, 'Nawabganj'), (54, 'Parbatipur');

-- Gaibandha (id: 55)
INSERT INTO thanas (zilla_id, name) VALUES
(55, 'Gaibandha Sadar'), (55, 'Fulchhari'), (55, 'Gobindaganj'), (55, 'Palashbari'), (55, 'Sadullapur'), (55, 'Saghata'), (55, 'Sundarganj');

-- Kurigram (id: 56)
INSERT INTO thanas (zilla_id, name) VALUES
(56, 'Kurigram Sadar'), (56, 'Bhurungamari'), (56, 'Char Rajibpur'), (56, 'Chilmari'), (56, 'Phulbari'), (56, 'Nageshwari'), (56, 'Rajarhat'), (56, 'Raomari'), (56, 'Ulipur');

-- Lalmonirhat (id: 57)
INSERT INTO thanas (zilla_id, name) VALUES
(57, 'Lalmonirhat Sadar'), (57, 'Aditmari'), (57, 'Hatibandha'), (57, 'Kaliganj'), (57, 'Patgram');

-- Nilphamari (id: 58)
INSERT INTO thanas (zilla_id, name) VALUES
(58, 'Nilphamari Sadar'), (58, 'Dimla'), (58, 'Domar'), (58, 'Jaldhaka'), (58, 'Kishoreganj'), (58, 'Saidpur');

-- Panchagarh (id: 59)
INSERT INTO thanas (zilla_id, name) VALUES
(59, 'Panchagarh Sadar'), (59, 'Atwari'), (59, 'Boda'), (59, 'Debiganj'), (59, 'Tetulia');

-- Thakurgaon (id: 60)
INSERT INTO thanas (zilla_id, name) VALUES
(60, 'Thakurgaon Sadar'), (60, 'Baliadangi'), (60, 'Haripur'), (60, 'Pirganj'), (60, 'Ranisankail');

-- MYMENSINGH DIVISION

-- Mymensingh (id: 61) - City Police Station Thanas + Upazilas
INSERT INTO thanas (zilla_id, name) VALUES
-- City Police Station Thanas
(61, 'Kotwali'), (61, 'Sadar South'),
-- Upazilas
(61, 'Mymensingh Sadar'), (61, 'Bhaluka'), (61, 'Dhobaura'), (61, 'Fulbaria'), (61, 'Gaffargaon'), (61, 'Gauripur'), (61, 'Haluaghat'), (61, 'Ishwarganj'), (61, 'Muktagachha'), (61, 'Nandail'), (61, 'Phulpur'), (61, 'Trishal'), (61, 'Tara Khanda');

-- Jamalpur (id: 62)
INSERT INTO thanas (zilla_id, name) VALUES
(62, 'Jamalpur Sadar'), (62, 'Baksiganj'), (62, 'Dewanganj'), (62, 'Islampur'), (62, 'Madarganj'), (62, 'Melandaha'), (62, 'Sarishabari');

-- Netrokona (id: 63)
INSERT INTO thanas (zilla_id, name) VALUES
(63, 'Netrokona Sadar'), (63, 'Atpara'), (63, 'Barhatta'), (63, 'Durgapur'), (63, 'Kalmakanda'), (63, 'Kendua'), (63, 'Khaliajuri'), (63, 'Madan'), (63, 'Mohanganj'), (63, 'Purbadhala');

-- Sherpur (id: 64)
INSERT INTO thanas (zilla_id, name) VALUES
(64, 'Sherpur Sadar'), (64, 'Jhenaigati'), (64, 'Nakla'), (64, 'Nalitabari'), (64, 'Sreebardi');

-- Admin Account (email: admin@lifeline.bd, password: Password123)
INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_admin, is_staff, staff_status) VALUES
('admin@lifeline.bd', '+8801700000000', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'System Administrator', 1, 1, 'O+', TRUE, TRUE, 'approved');

-- Sample Staff (Doctors and Organizers) - Password: Password123
INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_staff, staff_status, staff_role, is_donor) VALUES
('dr.rahman@lifeline.bd', '+8801711111111', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Dr. Abdul Rahman', 1, 1, 'A+', TRUE, 'approved', 'doctor', TRUE),
('dr.sultana@lifeline.bd', '+8801722222222', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Dr. Fatima Sultana', 2, 1, 'B+', TRUE, 'approved', 'doctor', TRUE),
('organizer.karim@lifeline.bd', '+8801733333333', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Karim Ahmed', 3, 1, 'O+', TRUE, 'approved', 'organizer', TRUE),
('organizer.akter@lifeline.bd', '+8801744444444', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Ayesha Akter', 1, 1, 'AB+', TRUE, 'approved', 'organizer', FALSE);

-- Pending Staff (for testing approval flow) - Password: Password123
INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_staff, staff_status, staff_role) VALUES
('dr.pending@lifeline.bd', '+8801755555555', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Dr. Pending Approval', 9, 2, 'A-', TRUE, 'pending', 'doctor');

-- Sample Donors (is_donor = TRUE) - Password: Password123
INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_donor, last_donation_date, points) VALUES
('donor1@example.com', '+8801611111111', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Md. Rahim Uddin', 1, 1, 'A+', TRUE, '2025-10-15', 30),
('donor2@example.com', '+8801622222222', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Nusrat Jahan', 2, 1, 'B+', TRUE, '2025-11-20', 20),
('donor3@example.com', '+8801633333333', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Shakib Hassan', 3, 1, 'O+', TRUE, NULL, 0),
('donor4@example.com', '+8801644444444', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Sadia Islam', 1, 1, 'AB+', TRUE, '2025-12-01', 10),
('donor5@example.com', '+8801655555555', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Tanvir Ahmed', 9, 2, 'A+', TRUE, NULL, 0);

-- Sample Receivers (is_receiver = TRUE) - Password: Password123
INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_receiver) VALUES
('receiver1@example.com', '+8801811111111', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Farhan Kabir', 1, 1, 'A+', TRUE),
('receiver2@example.com', '+8801822222222', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Lamia Chowdhury', 2, 1, 'B+', TRUE),
('receiver3@example.com', '+8801833333333', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Imran Hossain', 16, 3, 'O-', TRUE);

-- Dual Role Users (Both Donor and Receiver) - Password: Password123
INSERT INTO users (email, phone, password_hash, full_name, address_thana, address_zilla, blood_type, is_donor, is_receiver, last_donation_date, points) VALUES
('dual1@example.com', '+8801911111111', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Mehedi Hasan', 1, 1, 'O+', TRUE, TRUE, '2025-09-10', 40),
('dual2@example.com', '+8801922222222', '$2a$10$A6.zjGWfrAINT0qRJ/AQcuChZ/zwb4qezqxPuX73ROqXBVOK.seFy', 'Tasnuva Rahman', 3, 1, 'A-', TRUE, TRUE, NULL, 0);


-- Active Request (Pending)
INSERT INTO blood_requests (receiver_id, blood_type, units, date_needed, request_thana, request_zilla, status) VALUES
(11, 'A+', 2, '2026-01-20', 1, 1, 'pending');

-- Allocated Request
INSERT INTO blood_requests (receiver_id, blood_type, units, date_needed, request_thana, request_zilla, status, allocated_donor_id) VALUES
(12, 'B+', 1, '2026-01-18', 2, 1, 'allocated', 7);

-- Crossmatch Passed Request
INSERT INTO blood_requests (receiver_id, blood_type, units, date_needed, request_thana, request_zilla, status, allocated_donor_id, crossmatch_status, verified_by_staff_id) VALUES
(13, 'O-', 1, '2026-01-15', 16, 3, 'crossmatch_passed', 10, 'passed', 2);

-- Completed Request
INSERT INTO blood_requests (receiver_id, blood_type, units, date_needed, request_thana, request_zilla, status, allocated_donor_id, crossmatch_status, verified_by_staff_id, completed_at) VALUES
(15, 'O+', 2, '2025-12-20', 1, 1, 'completed', 6, 'passed', 2, '2025-12-22 10:30:00');

-- SAMPLE DONATIONS

INSERT INTO donations (donor_id, request_id, donation_date, units_donated, points_earned) VALUES
(6, 4, '2025-12-22', 2, 10);

-- Messages for allocated request (id: 2)
INSERT INTO messages (request_id, from_user_id, to_user_id, message_text, is_read) VALUES
(2, 12, 7, 'Hello, I urgently need B+ blood. Can you help?', TRUE),
(2, 7, 12, 'Yes, I am available. When should I come?', TRUE),
(2, 12, 7, 'Please come to Dhaka Medical College Hospital tomorrow at 10 AM.', FALSE);

-- Messages for crossmatch passed request (id: 3)
INSERT INTO messages (request_id, from_user_id, to_user_id, message_text, is_read) VALUES
(3, 13, 10, 'Thank you so much for agreeing to donate!', TRUE),
(3, 10, 13, 'Happy to help. Please let me know the details.', TRUE);

-- SAMPLE CAMPAIGNS

INSERT INTO campaigns (name, description, start_date, end_date, location_zilla, location_thana, status) VALUES
('Winter Blood Drive 2026', 'Blood donation campaign for winter season', '2026-01-25', '2026-01-26', 1, 1, 'planned'),
('Chittagong Health Fair', 'Community blood donation event', '2026-02-10', '2026-02-11', 2, 9, 'planned');

-- SAMPLE STAFF CAMPAIGN ASSIGNMENTS

INSERT INTO staff_campaigns (staff_id, campaign_id, role, request_status, points_earned) VALUES
(2, 1, 'doctor', 'assigned', 5),
(3, 1, 'doctor', 'assigned', 5),
(4, 1, 'organizer', 'assigned', 5),
(5, 1, 'organizer', 'assigned', 5);

-- SAMPLE LOGS

INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES
(1, 'USER_REGISTERED', 'user', 11, 'New receiver registered'),
(1, 'REQUEST_CREATED', 'blood_request', 1, 'Blood request created for A+ blood'),
(2, 'CROSSMATCH_VERIFIED', 'blood_request', 3, 'Crossmatch verified as passed'),
(1, 'REQUEST_COMPLETED', 'blood_request', 4, 'Blood request marked as completed');


-- Clear existing campaign data
DELETE FROM staff_campaigns;
DELETE FROM campaigns;

-- Reset AUTO_INCREMENT
ALTER TABLE campaigns AUTO_INCREMENT = 1;

-- Upcoming Campaign in Dhaka
INSERT INTO campaigns (id, name, description, start_date, end_date, location_zilla, location_thana, required_doctors, required_organizers, status) VALUES
(1, 'Dhaka Blood Donation Drive 2026', 'Large-scale blood donation campaign in Dhaka city', '2026-02-15', '2026-02-15', 1, 1, 5, 5, 'planned');

-- Active Campaign in Chittagong (Kotwali thana)
-- Note: Chittagong is zilla_id 14, Kotwali is approximately thana_id 175 (counting from Dhaka thanas)
INSERT INTO campaigns (id, name, description, start_date, end_date, location_zilla, location_thana, required_doctors, required_organizers, status) VALUES
(2, 'Chittagong Medical Camp', 'Blood donation camp at Chittagong Medical College', '2026-01-20', '2026-01-20', 14, 175, 3, 3, 'active');

-- Planned Campaign in Sylhet (Sylhet Sadar thana)
-- Note: Sylhet is zilla_id 49, Sylhet Sadar is approximately thana_id 450 (counting from earlier divisions)
INSERT INTO campaigns (id, name, description, start_date, end_date, location_zilla, location_thana, required_doctors, required_organizers, status) VALUES
(3, 'Sylhet Community Blood Drive', 'Community-based blood donation initiative', '2026-03-01', '2026-03-01', 49, 450, 4, 4, 'planned');


-- Approved staff for Dhaka campaign (campaign_id = 1)
INSERT INTO staff_campaigns (staff_id, campaign_id, role, request_status, points_earned) VALUES
(2, 1, 'doctor', 'approved', 5),  -- Dr. Abdul Rahman
(3, 1, 'doctor', 'approved', 5);  -- Dr. Fatima Sultana

-- Pending request for Chittagong campaign (campaign_id = 2)
INSERT INTO staff_campaigns (staff_id, campaign_id, role, request_status, points_earned) VALUES
(4, 2, 'organizer', 'requested', 0);  -- Karim Ahmed requesting to join

-- Approved staff for Sylhet campaign (campaign_id = 3)
INSERT INTO staff_campaigns (staff_id, campaign_id, role, request_status, points_earned) VALUES
(5, 3, 'organizer', 'approved', 5);  -- Ayesha Akter


-- INITIALIZE BLOOD STORAGE (Zilla-Based)
-- Initialize Blood Storage for all 64 zillas and 8 blood types (512 rows)
INSERT INTO blood_storage (zilla_id, blood_type, units_available)
SELECT z.id, bt.blood_type, 0
FROM zillas z
CROSS JOIN (
    SELECT 'A+' as blood_type UNION ALL
    SELECT 'A-' UNION ALL
    SELECT 'B+' UNION ALL
    SELECT 'B-' UNION ALL
    SELECT 'AB+' UNION ALL
    SELECT 'AB-' UNION ALL
    SELECT 'O+' UNION ALL
    SELECT 'O-'
) bt
ORDER BY z.id, bt.blood_type;

-- UPDATE BLOOD STORAGE (Sample Inventory for Dhaka)
-- Add sample inventory to Dhaka (zilla_id = 1) for demonstration
UPDATE blood_storage SET units_available = 15 WHERE zilla_id = 1 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 8 WHERE zilla_id = 1 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 12 WHERE zilla_id = 1 AND blood_type = 'B+';
UPDATE blood_storage SET units_available = 5 WHERE zilla_id = 1 AND blood_type = 'AB+';
UPDATE blood_storage SET units_available = 3 WHERE zilla_id = 1 AND blood_type = 'O-';
UPDATE blood_storage SET units_available = 4 WHERE zilla_id = 1 AND blood_type = 'A-';
UPDATE blood_storage SET units_available = 6 WHERE zilla_id = 1 AND blood_type = 'B-';
UPDATE blood_storage SET units_available = 2 WHERE zilla_id = 1 AND blood_type = 'AB-';


-- Add sample inventory to other major zillas for demonstration
-- Chittagong (zilla_id = 14)
UPDATE blood_storage SET units_available = 10 WHERE zilla_id = 14 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 5 WHERE zilla_id = 14 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 7 WHERE zilla_id = 14 AND blood_type = 'B+';
UPDATE blood_storage SET units_available = 3 WHERE zilla_id = 14 AND blood_type = 'AB+';

-- Rajshahi (zilla_id = 25)
UPDATE blood_storage SET units_available = 8 WHERE zilla_id = 25 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 4 WHERE zilla_id = 25 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 6 WHERE zilla_id = 25 AND blood_type = 'B+';

-- Khulna (zilla_id = 33)
UPDATE blood_storage SET units_available = 12 WHERE zilla_id = 33 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 6 WHERE zilla_id = 33 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 4 WHERE zilla_id = 33 AND blood_type = 'B-';

-- Sylhet (zilla_id = 49)
UPDATE blood_storage SET units_available = 9 WHERE zilla_id = 49 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 5 WHERE zilla_id = 49 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 3 WHERE zilla_id = 49 AND blood_type = 'AB+';


-- Add more sample inventory to various zillas for realistic demonstration
-- Barisal (zilla_id = 41)
UPDATE blood_storage SET units_available = 7 WHERE zilla_id = 41 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 3 WHERE zilla_id = 41 AND blood_type = 'A+';

-- Rangpur (zilla_id = 53)
UPDATE blood_storage SET units_available = 6 WHERE zilla_id = 53 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 4 WHERE zilla_id = 53 AND blood_type = 'B+';

-- Mymensingh (zilla_id = 61)
UPDATE blood_storage SET units_available = 5 WHERE zilla_id = 61 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 2 WHERE zilla_id = 61 AND blood_type = 'A+';

-- Comilla (zilla_id = 18)
UPDATE blood_storage SET units_available = 8 WHERE zilla_id = 18 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 5 WHERE zilla_id = 18 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 3 WHERE zilla_id = 18 AND blood_type = 'B+';

-- Gazipur (zilla_id = 3)
UPDATE blood_storage SET units_available = 9 WHERE zilla_id = 3 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 6 WHERE zilla_id = 3 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 4 WHERE zilla_id = 3 AND blood_type = 'B+';
UPDATE blood_storage SET units_available = 2 WHERE zilla_id = 3 AND blood_type = 'AB+';

-- Narayanganj (zilla_id = 9)
UPDATE blood_storage SET units_available = 7 WHERE zilla_id = 9 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 4 WHERE zilla_id = 9 AND blood_type = 'A+';

-- Bogra (zilla_id = 26)
UPDATE blood_storage SET units_available = 10 WHERE zilla_id = 26 AND blood_type = 'O+';
UPDATE blood_storage SET units_available = 5 WHERE zilla_id = 26 AND blood_type = 'A+';
UPDATE blood_storage SET units_available = 3 WHERE zilla_id = 26 AND blood_type = 'B-';
