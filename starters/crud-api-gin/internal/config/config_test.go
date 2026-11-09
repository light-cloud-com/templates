package config

import "testing"

func TestDatabaseURL(t *testing.T) {
	tests := []struct {
		name string
		env  map[string]string
		want string
	}{
		{
			name: "defaults",
			env:  map[string]string{},
			want: "postgres://postgres:@localhost:5432/postgres?pool_max_conns=5&sslmode=require",
		},
		{
			name: "host without port gets 5432",
			env:  map[string]string{"DB_HOST": "10.0.0.5", "DB_NAME": "app", "DB_USER": "app", "DB_PASSWORD": "secret"},
			want: "postgres://app:secret@10.0.0.5:5432/app?pool_max_conns=5&sslmode=require",
		},
		{
			name: "host with port is kept",
			env:  map[string]string{"DB_HOST": "db.internal:6543"},
			want: "postgres://postgres:@db.internal:6543/postgres?pool_max_conns=5&sslmode=require",
		},
		{
			name: "password is escaped",
			env:  map[string]string{"DB_PASSWORD": "p@ss/w:rd?"},
			want: "postgres://postgres:p%40ss%2Fw%3Ard%3F@localhost:5432/postgres?pool_max_conns=5&sslmode=require",
		},
		{
			name: "sslmode disable for a local database",
			env:  map[string]string{"DB_SSLMODE": "disable"},
			want: "postgres://postgres:@localhost:5432/postgres?pool_max_conns=5&sslmode=disable",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			for _, key := range []string{"DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_SSLMODE"} {
				t.Setenv(key, tt.env[key])
			}
			if got := databaseURL(); got != tt.want {
				t.Errorf("databaseURL() = %s\nwant %s", got, tt.want)
			}
		})
	}
}
