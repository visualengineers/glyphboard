_environments = {
    "production": {
        "cpu_count": 4,
        "host": "jupyter",
        "port": 3020,
        "glyphboardDataDirectory": "/home/glyphboard/glyphboard/backend/data",
    },
    "develop": {
        "inherit": "production",
        "host": "localhost",
        "glyphboardDataDirectory": "data",
    },
}

class _Config:
    def __init__(self, envs, default_env):
        self._environments = envs
        self._environment = default_env

    def set_environment(self, env):
        self._environment = env
        
    @property
    def config(self):
        return self._load_config(self._environment)

    @property
    def environment(self):
        return self._environment

    def _load_config(self, env):
        config = {}
        visited_envs = []
        while env:
            if not env in self._environments:
                raise "no such environment: " + str(env)
            if env in visited_envs:
                raise "loop in inheritance chain: " + str(visited_envs)

            config = { **self._environments[env], **config }
            visited_envs.append(env)
            env = config.pop("inherit", None)
        return config

config_manager = _Config(_environments, "production")