# edx-modulestore

[![Build Status](https://secure.travis-ci.org/IONISx/edx-modulestore.svg?branch=master)](https://travis-ci.org/IONISx/edx-modulestore)
[![Dependencies Status](https://david-dm.org/IONISx/edx-modulestore.svg)](https://david-dm.org/IONISx/edx-modulestore)
[![Dev Dependencies Status](https://david-dm.org/IONISx/edx-modulestore/dev-status.svg)](https://david-dm.org/IONISx/edx-modulestore#info=devDependencies)

> Easy browsing of Open edX modulestores

## Getting started

*TODO*

## Documentation

### Course attributes

#### Id

Name: `id`  
Type: `String`  

**Read-only** attribute used to find and identify courses.

#### Name

Name: `name`  
Type: `String`  

Name or title of the course.

#### Number

Name: `number`  
Type: `String`  

Number of the course (e.g.: `"CS101"`).

#### Organization

Name: `organization`  
Type: `String`  

Organizer of the course (e.g.: `"IONISx"`).

#### Description (external)

Name: `description`  
Type: `String`  

Short description of the course.

#### Start date

Name: `startDate`  
Type: `Date`  

Start date of the course.

#### End date

Name: `endDate`  
Type: `Date`  

End date of the course.

#### Enrollment start date

Name: `enrollmentStartDate`  
Type: `Date`  

Enrollment start date of the course.

#### Enrollment end date

Name: `enrollmentEndDate`  
Type: `Date`  

Enrollment end date of the course.

#### Overview (external)

Name: `overview`  
Type: `String` (usually HTML)  

Overview of the course, usually used on the course’s about page.

#### About page URL

Name: `aboutPage`  
Type: `String`  

Link to the about page (on the LMS – if configured correclty).

#### Thumbnail URL

Name: `image`  
Type: `String`  

Link to the course’s thumbnail (on the LMS _ if configured correclty).

#### State

Name: `state`  
Type: `String` (enumeration)  

Determines the state of the course, with the following values:

State | Description | Can enroll? | Can access?
--- | --- | --- | ---
`hidden` | Course is not open for enrollment | No | No
`upcoming` | Course is open for enrollment but not running | Yes | No
`open` | Course is open for enrollment and running | Yes | Yes
`finishing` | Course is running but enrollement is closed | No | Yes
`finished` | Course is closed | No | No

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
