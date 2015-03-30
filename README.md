## This is a Node applciation, providing REST APIs for [fitting timer iOS app](https://github.com/qiaoyu314/Interval-Timer).

## Available API:

- Get all timers: [GET] /timers 
- Create a timer: [POST] /timers
When this API is used, parameter is expected if you want to create a customized timer. if parameter is not specified, the template will be used:
```
{ timer:{
    name: 'template',
	  warmUpLength: 10,
	  roundLength: 30,
	  restLength: 20,
	  coolDownLength: 30,
	  cycle: 10,
	  description: "This is a good timer"
  }
}
```
- Delete all timers: [Delete] /timers
