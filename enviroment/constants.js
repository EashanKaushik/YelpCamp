var constants = {
	"campground": {
		"name": {
			name: "name",
			maxLength: 80,
			isRequired: true,
			message: "Campground\'s name"
		},
		"desc": {
			name: "desc",
			maxLength: 700,
			isRequired: true,
			message: "Campground\'s description"
		},
		"location": {
			name: "location",
			maxLength: 150,
			isRequired: false,
			message: "Campground\'s location"
		},
		"sortingOptions": [
				'name',
				'price',
				'createdAt',
				'location',
				'averageRating'
		]
	},
	"comment": {
		"text": {
			name: "text",
			maxLength: 300,
			isRequired: false,
			message: "comment\'s text"
		}
	},
	"user": {
		"username": {
			name: "username",
			maxLength: 50,
			isRequired: true,
			message: "user\'s username"
		},
		"password": {
			name: "password",
			maxLength: 50,
			isRequired: true,
			message: "user\'s password"
		},
		"firstName": {
			name: "firstName",
			maxLength: 50,
			isRequired: true,
			message: "user\'s first name"
		},
		"lastName": {
			name: "lastName",
			maxLength: 50,
			isRequired: true,
			message: "user\'s last name"
		},
		"email": {
			name: "email",
			maxLength: 80,
			isRequired: true,
			message: "user\'s email"
		},
		"adminSecretCode": {
			name: "adminSecretCode",
			maxLength: 30,
			isRequired: false,
			message: "user\'s admin secret code"
		}
	}
}

module.exports = constants;