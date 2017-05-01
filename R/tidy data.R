# This first line only needs to be run once after installing R.
# It can be commented out for subsequent runs (but it's ok to leave it)
install.packages(c('tidyverse', 'readxl'))

library(tidyverse)

# load data
filename = '2011-present.xlsx'
data = lapply(readxl::excel_sheets(filename), function(sheet) readxl::read_excel(filename, sheet, col_types = rep("text", 12)))
data = bind_rows(data)

# simplify columns
data = data %>%
  rename(year = `Acad Year`) %>%
  rename(minorCount = `# of Minors`) %>%
  rename(majorCount = `# of Majors`) %>%
  select(-`Curr Acad Level`)

# tidy
data = data %>% 
  gather(majorNumber, major, `Major 1`:`Major 4`, `Minor 1`:`Minor 3`) %>%
  filter(!is.na(major)) %>%
  separate(majorNumber, c('type', 'number'))

# sanity check
data %>%
  filter(type == 'Major') %>%
  group_by(ID, majorCount) %>%
  summarise(count = n()) %>%
  filter(as.numeric(majorCount) != count)
data %>%
  filter(type == 'Minor') %>%
  group_by(ID, minorCount) %>%
  summarise(count = n()) %>%
  filter(as.numeric(minorCount) != count)
data %>%
  group_by(ID) %>%
  mutate(year = as.numeric(year)) %>%
  summarise(yearRange = max(year) - min(year)) %>%
  filter(yearRange > 1)

# division grouping
divisions = read_csv('divisions.csv')
data = data %>% left_join(divisions, 'major')

# combine and rename majors
data = data %>% mutate(display_name = ifelse(is.na(display_name), major, display_name))
data = data %>% select(-major)
data = data %>% rename(major = display_name)


# shrink data for file output
data = data %>%
  mutate(ID = as.integer(factor(ID))) %>%
  select(-code, -number, -majorCount, -minorCount)

# output
write_csv(data, '../web/wcas_data.csv')

#######

# list of non-WCAS majors
levels(factor((data %>% filter(is.na(division)))$major))
# list of minor-only subjects
data %>% 
  filter(!is.na(division)) %>%
  group_by(major) %>%
  summarize(hasmajor = sum(type=='Major')>0, hasminor = sum(type=='Minor')>0, division = division[1], subdivision = subdivision[1]) %>%
  filter(hasmajor == 0) %>%
  mutate(subdivision = as.character(subdivision)) %>%
  arrange(division, subdivision, major) %>%
  select(-hasmajor, -hasminor)
# biggest major
data %>% filter(!is.na(division)) %>% group_by(major) %>% 
  ggplot() +
  aes(x=major, fill=major) +
  geom_bar() +
  coord_flip() +
  scale_y_continuous(expand = c(0,0)) +
  #facet_wrap(~year) +
  guides(fill='none')



